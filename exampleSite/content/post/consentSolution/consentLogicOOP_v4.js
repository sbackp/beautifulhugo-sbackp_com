class CookieConsent {
    constructor() {
        this.cspEventsList = ['load', 'updateDeclineAll', 'updateAcceptAll', 'updateSelected', 'deleteConsent'];
        this.consentsList = ['necessary', 'personalization', 'statistics', 'marketing', 'social'];

        this.params = this.getURLParams();
    }

    run_program() {
        this.messageEventSend('load');

        if (this.params !== null) {
            console.log(this.params);
            const consents = this.getConsent();
            if (consents !== null) {
                this.messageEventSend('load', 'return consents', consents);
            } else {
                this.messageEventSend('load', 'no consents', {});
                this.messageEventListener();
            }

        } else {
            // consents invalid URL params
            console.log('consent: invalid URL params');
            //this.messageEventSend('consents invalid URL params');
        }
    }

    // Message - START
    messageEventSend(m, s = '', c = {}) {
        const messageObj = { message: m, status: s, consents: c };
        window.parent.postMessage(messageObj, this.params.referrerUrl);
        console.log('message send');
    }

    messageEventListener() {
        window.addEventListener('message', (event) => {
            if (event.data.message === 'set consent') {
                this.setConsent(event.data.consents)
            }
        })
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
    setConsent(consents) {
        this.setCookie(this.params.consentName, JSON.stringify(consents), this.params.cspExpDays);
        console.log('iframe set consents');
    }

    deleteConsent() {
        this.setCookie(this.params.consentName, '', 0);
        console.log('iframe delete consents');
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
            const url = new URL(document.location.href);
            const referrer = new URL(url.searchParams.get('referrer'));

            params.referrerUrl = referrer.href;
            params.referrerDomain = referrer.host;
            params.cspId = url.searchParams.get('cspid');
            params.consentName = ''.concat('cookieConsent_', params.cspId);
            params.cspExpDays = parseInt(url.searchParams.get('cspexpdays'));
            params.timestamp = new Date().getTime();

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