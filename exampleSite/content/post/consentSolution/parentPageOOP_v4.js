class CookieConsentParent {
    constructor(cspId, cspWebsites, cspExpDays) {
        this.cspId = cspId;
        this.cspWebsites = cspWebsites;
        this.cspExpDays = cspExpDays;
        this.visitorId = 'visitorid'; //change
        this.visitId = 'visitid'; // change
        this.cspConsentName = 'cookieConsent';
        this.cspConsentNameWithId = ''.concat(this.cspConsentName, '_', this.cspId);

        this.origin = document.location.origin;
        this.pathname = document.location.pathname;
        this.pagePath = ''.concat(this.origin, this.pathname);

        this.timestamp = new Date().getTime();
        this.expDatetime = this.timestamp + (86400000 * this.cspExpDays);

        this.consentId = this.gen_random_uid(100);

        this.iframeId = 'cookie-consent-sharing';
        this.iframeDomain = 'https://idyllic-kulfi-7c87be.netlify.app';
        this.iframeLoaded = false;
        this.consentsList = ['necessary', 'personalization', 'statistics', 'marketing', 'social'];

        this.iframeUrl = ''.concat(this.iframeDomain, '?referrer=', this.pagePath, '&cspid=', this.cspId, '&cspexpdays=', this.cspExpDays);
    }


    run_program() {
        this.insertIframe();
        this.messageEventListener();

        setTimeout(() => {
            if (this.iframeLoaded === false) {
                /* consents iframe has not responded within two seconds */
                console.log('consents iframe has not responded within two seconds')
            }
        }, 2000);
    }

    messageEventListener() {
        window.addEventListener('message', (event) => {

            if (event.origin === this.iframeDomain) {
                if (event.data.message === 'load') {
                    this.iframeLoaded = true;
                    if (event.data.status === 'return consents') {
                        console.log('return consents');
                        console.log(event.data.consents);
                    } else if (event.data.status === 'no consents') {
                        console.log('no consents');

                        // does consents exist locally with valid visitorid
                        const consent = this.getLocalConsent();
                        if (consent !== null) {
                            console.log('consent send to iframe');
                            // send consent to iframe
                            this.messageEventSend('set consent', consent);
                        } else {
                            // request new consent
                            OneTrust.ToggleInfoDisplay();
                            Optanon.OnConsentChanged(function () {
                                const cookie_consents_approved_onetrust = [];
                                if (OnetrustActiveGroups.indexOf('C0001') > -1) {
                                    cookie_consents_approved_onetrust.push('necessary');
                                }
                                if (OnetrustActiveGroups.indexOf('C0002') > -1) {
                                    cookie_consents_approved_onetrust.push('statistic');
                                }
                                if (OnetrustActiveGroups.indexOf('C0003') > -1) {
                                    cookie_consents_approved_onetrust.push('functional');
                                }
                                if (OnetrustActiveGroups.indexOf('C0004') > -1) {
                                    cookie_consents_approved_onetrust.push('marketing');
                                }
                                if (OnetrustActiveGroups.indexOf('BG32') > -1) {
                                    cookie_consents_approved_onetrust.push('social');
                                }

                                this.setConsent(cookie_consents_approved_onetrust, []);
                                this.messageEventSend();
                            });
                            // set consent locally
                            // set consent in iframe
                            // send to kafka
                        }
                    }
                }
            }

        });
    }

    messageEventSend(m, c = {}) {
        const messageObj = { message: m, consents: c };
        const iframeElement = document.getElementById(this.iframeId);
        if (iframeElement !== null) {
            iframeElement.postMessage(messageObj, this.pagePath);
        }
    }

    // getLocalConsent
    getLocalConsent() {
        try {
            let consent = JSON.parse(this.getCookie());
            if (consent.expDatetime > this.datetime) {
                consent = null;
            }
            return consent;
        } catch (err) {
            return null;
        }
    }

    //setConsent
    setConsent(consentsApproved = [], consentsDenied = []) {
        const consents = {
            cspID: this.cspID,
            cspWebsites: this.cspWebsites,
            cspExpDays: this.cspExpDays,
            timestamp: this.timestamp,
            expDatetime: this.expDatetime,
            consentsApproved: consentsApproved,
            consentsDenied: consentsDenied,
            consentId: this.consentId,
            consentDomain: this.pagePath,
            consentVisitId: this.visitId,
            consentVisitorId: this.visitorId,
        };

        this.setCookie(JSON.stringify(consents), this.cspExpDays);
        // SEND to cookie-consent-sharing iframe
        this.messageEventSend('set consent', consents);
        // send to kafka
    }

    // deleteConsent
    deleteConsent() {
        this.setCookie('', 0);
    }

    //getcookie
    getCookie() {
        const name = ''.concat(this.cspConsentNameWithId, '=');
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

    //setCookie
    setCookie(cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = ''.concat('expires=', d.toUTCString());
        document.cookie = ''.concat(this.cspConsentNameWithId, '=', cvalue, ';', expires, ';path=/;SameSite=None;Secure');
    }

    // insert cookie-consent-sharing iframe
    insertIframe() {
        const iframe = document.createElement('iframe');
        iframe.id = this.iframeId;
        iframe.src = this.iframeUrl;
        iframe.setAttribute('style', 'display:none !important;');
        document.body.appendChild(iframe);

        return iframe;
    }

    gen_random_uid(length) {
        /* Generate random ID with timestamp */
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!';
        const charLength = chars.length;
        let result = '';
        for (let i = 0; i < length; i += 1) {
            result += chars.charAt(Math.floor(Math.random() * charLength));
        }
        result = ''.concat(result, '-', this.timestamp);
        return result;
    }

    kafkaRequest() {
        return;
    }
}


const ConsentParentInstance = new CookieConsentParent('987654', ['sbackp.dk', 'sbackp.com', 'tryg.dk'], 180);
ConsentParentInstance.run_program();