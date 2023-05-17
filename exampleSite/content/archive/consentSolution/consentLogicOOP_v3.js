class CookieConsent {
    constructor() {
        this.cspEventsList = ['load', 'updateDeclineAll', 'updateAcceptAll', 'updateSelected', 'deleteConsent'];
        this.consentsList = ['necessary', 'personalization', 'statistics', 'marketing', 'social'];

        this.params = this.getURLParams();
        this.uid = this.gen_random_uid(100);
    }

    run_program() {
        this.messageEventSend('consents iframe has loaded');

        if (this.params === null) {
            // consents invalid URL params
            console.log('consent: invalid URL params');
            this.messageEventSend('consents invalid URL params');
        } else {
            window.addEventListener('message', (event) => {
                if (event.data.message === 'load') {
                    const consents = this.getConsent();
                    if (consents !== null) {
                        this.messageEventSend('consents return', consents);
                    } else {
                        this.messageEventSend('consents request');
                    }
                } else if (event.data.message === 'updateDeclineAll') {
                    this.setConsent([], this.consentsList);
                } else if (event.data.message === 'updateAcceptAll') {
                    this.setConsent(this.consentsList, []);
                } else if (event.data.message === 'updateSelected') {
                    this.setConsent(consentsApproved = event.data.consentsApproved, consentsDenied = event.data.consentsDenied);
                } else if (event.data.message === 'deleteConsent') {
                    this.deleteConsent();
                } else {
                    console.log('******************');
                    console.log('message: ' + event.origin);
                    console.log('message: ' + event.data);
                    console.log('******************');
                }
            });
        }
    }

    gen_random_uid(length) {
        /* Generate random ID with timestamp */
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!';
        const charLength = chars.length;
        let result = '';
        for (let i = 0; i < length; i += 1) {
        result += chars.charAt(Math.floor(Math.random() * charLength));
        }
        const timestamp = new Date().getTime();
        result = ''.concat(result, '-', timestamp);
        return result;
    }


    // Message - START
    messageEventSend(m, consents={}) {
        const messageObj = {message: m, consents: consents};
        window.parent.postMessage(messageObj, this.params.referrerUrl);
    }

    messageEventListenerTest() {        
        window.addEventListener('message', (event) => {
            console.log('message: '+event.origin);
            console.log('message: '+event.data);
        });
    }
    // Message - END

    // Consent - START
    getConsent() {
        let consents = null;
        try {
            consents = this.getCookie(this.params.consentName);
            consents = JSON.parse(consents);
            consents = this.validateParams(consents);
            
            if (consents.expDatetime < consents.timestamp) {
                consents = null;
            }
        } catch (err) {/* empty */ }
        
        return consents;
    }
    setConsent(consentsApproved = [], consentsDenied = []) {
        const consents = {
            cspID: this.params.cspID,
            cspWebsites: this.params.cspWebsites,
            cspExpDays: this.params.cspExpDays,
            expDatetime: this.params.expDatetime,
            timestamp: this.params.timestamp,
            consentsApproved: consentsApproved,
            consentsDenied: consentsDenied,
            uid: this.uid,
            consentDomain: this.params.referrerDomain,
        };

        this.setCookie(this.params.consentName, JSON.stringify(consents), this.params.cspExpDays);
        this.messageEventSend('consents set', consents);
    }

    deleteConsent() {
        this.setCookie(this.params.consentName, '', 0);
        this.messageEventSend('consents delete');
    }
    // Consent - END

    // Cookie - START
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
    // Cookie - END

    getURLParams() {
        /*
        Get url parameters and validate. ,
        Returns an object params with value null if any param is missing or invalid
        */
        let params = {};
        try {
            const url = new URL(document.location.href); // parameters appended to iframe url
            const referrer = new URL(url.searchParams.get('referrer')); // url

            params.referrerUrl = referrer.href;
            params.referrerDomain = referrer.host;
            params.cspID = url.searchParams.get('cspid');
            params.consentName = ''.concat('consent_', params.cspID);
            params.cspWebsites = JSON.parse(url.searchParams.get('cspwebsites'));
            params.cspExpDays = parseInt(url.searchParams.get('cspExpDays'));
            params.timestamp = new Date().getTime();
            params.expDatetime = params.timestamp + (86400000 * params.cspExpDays);

            params = this.validateParams(params);
        } catch (err) {
            params = null;
        }
        return params;
    }

    validateParams(params) {
        let tempParams = params;
        try {
            for (const [key, value] of Object.entries(tempParams)) {
                if (key === 'cspWebsites' || key === 'consentsApproved' || key === 'consentsDenied') {
                    if (Array.isArray(value) !== true) {
                        tempParams = null;
                        break;
                    }
                } else if (key === 'cspExpDays' || key === 'timestamp' || key === 'expDatetime') {
                    if (Number.isInteger(value) !== true) {
                        tempParams = null;
                        break;
                    }
                } else if (typeof value !== 'string') {
                    tempParams = null;
                    break;
                }
            }
            
        } catch (err) {
            tempParams = null;
        }
        return tempParams;
    }
}

const CookieConsentInstance = new CookieConsent();
CookieConsentInstance.run_program();