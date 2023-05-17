class CookieConsentParent {
    constructor(cspWebsiteId, cspWebsites, cspExpDays) {
        this.iframeId = 'cookie-consent-iframe';
        this.iframeDomain = 'https://idyllic-kulfi-7c87be.netlify.app';
        
        this.referrer = document.location.href;
        this.cspWebsiteId = cspWebsiteId;
        this.cspWebsites = JSON.stringify(cspWebsites);
        this.cspExpDays = cspExpDays;

        this.consentName = ''.concat('consent_', this.cspWebsiteId);   
        this.iframeLoaded = false;

        this.iframeUrl = ''.concat(this.iframeDomain, '?referrer=', this.referrer, '&cspid=', this.cspWebsiteId, '&cspwebsites=', this.cspWebsites, '&cspExpDays=', this.cspExpDays);
    }

    run_program() {
        this.iframeElement = this.insertIframe();
        this.messageEventListener();
        
        setTimeout(() => {
            if (this.iframeLoaded === false) {
                /* consents iframe has not responded within two seconds */
                console.log('consents iframe has not responded within two seconds')
            }
        }, 2000)        
    }

    messageEventListener() {
        window.addEventListener('message', (event) => {
            if (event.origin === this.iframeDomain) {
                if (event.data.message === 'consents iframe has loaded') {
                    this.iframeLoaded = true;
                    this.messageEventSend('load');
                } else if (event.data.message === 'consents invalid URL params') { 
                    /* invalid URL params */
                    console.log('consents invalid URL params');
                } else if (event.data.message === 'consents delete') { 
                    this.deleteConsent();
                } else if (event.data.message === 'consents return' || event.data.message === 'consents set') {
                    this.setConsent(event.data.consents)
                } else if (event.data.message === 'consents request') { 
                    console.log('consents request');
                    // show consent banner
                    // bind events to iframe
                }  else {
                    console.log('---------------------');
                    console.log('received different message');
                    console.log(event.origin);
                    console.log(event.data);
                    console.log('---------------------');
                }
            } else {
                /* invalid origin */
            }
            
        });
    }

    messageEventSend(m, consentsApproved = [], consentsDenied = []) {
        const messageObj = { message: m, consentsApproved: consentsApproved, consentsDenied: consentsDenied };
        this.iframeElement.contentWindow.postMessage(messageObj, this.iframeDomain);
    }
    
    getConsent() {
        let consent = null;
        try {
            consent = JSON.parse(this.getCookie(this.consentName));
        } catch (err) { /* empty */ }
        return consent;
    }

    setConsent(value) {
        this.setCookie(this.consentName, JSON.stringify(value), this.cspExpDays);
    }  

    deleteConsent() {
        this.setCookie(this.consentName, '', 0);
    }

    getCookie(cname) {
        const name = ''.concat(cname, '=');
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i += 1) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
        }
        return null;
    }

    setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = ''.concat('expires=', d.toUTCString());
        document.cookie = ''.concat(cname, '=', cvalue, ';', expires, ';path=/;SameSite=None;Secure');
    }   

    insertIframe() {
        const iframe = document.createElement('iframe');
        iframe.id = this.iframeId;
        iframe.src = this.iframeUrl;
        iframe.setAttribute('style', 'display:none !important;');
        document.body.appendChild(iframe);

        return iframe;
    }
}

const ConsentParentInstance = new CookieConsentParent('987654', ['sbackp.dk', 'sbackp.com', 'tryg.dk'], 180);
ConsentParentInstance.run_program();