class crossSiteConsent {
    constructor(cspId, cspWebsites) {
        this.cspId = cspId;
        this.cspWebsites = cspWebsites;
        this.cspExpDays = 182;

        this.timestamp = new Date().getTime();
        this.expDatetime = this.timestamp + (86400000 * this.cspExpDays);

        this.consentId = this.gen_random_uid(100);

        this.iframeLoaded = false;

        this.cspConsentName = 'cookieconsent';
        this.cspConsentNameWithId = ''.concat(this.cspConsentName, '_', this.cspId);

        this.origin = document.location.origin;
        this.pathname = document.location.pathname;
        this.pagePath = ''.concat(this.origin, this.pathname);
        this.iframeDomain = 'https://idyllic-kulfi-7c87be.netlify.app';
        this.iframeUrl = ''.concat(this.iframeDomain, '?referrer=', this.pagePath, '&cspid=', this.cspId, '&cspexpdays=', this.cspExpDays);
        this.iframeId = 'crossSiteConsent';
    }

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
        };

        this.setCookie(JSON.stringify(consents), this.cspExpDays);
        this.messageEventSend('set consent', consents);
        // send to kafka
    }
    deleteConsent() {
        this.setCookie(this.cspConsentNameWithId, -1);
        this.messageEventSend('delete consent')
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
        return '';
    }
    setCookie(cvalue, exdays) {
        const d = new Date();
        d.setTime(this.expDatetime);
        const expires = ''.concat('expires=', d.toUTCString());
        document.cookie = ''.concat(this.cspConsentNameWithId, '=', cvalue, ';', expires, ';path=/;SameSite=None;Secure');
    }

    generateUUID(length) {
        /* Generate random ID with timestamp */
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!';
        let result = '';
        for (let i = 0; i < length; i += 1) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result = ''.concat(result, '-', this.timestamp);
        return result;
    }

    messageEventSend(m, c = {}) {
        const messageObj = { message: m, consents: c };
        const iframeElement = document.getElementById(this.iframeId);
        if (iframeElement !== null) {
            iframeElement.postMessage(messageObj, this.pagePath);
        }
    }

    insertIframe() {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('id', this.iframeId);
        iframe.setAttribute('src', this.iframeUrl);
        iframe.setAttribute('style', 'display:none !important;');
        document.body.appendChild(iframe);
        return iframe;
    }

    insertOneTrust() {
        return;
    }

    main() {
        return;
    }

}