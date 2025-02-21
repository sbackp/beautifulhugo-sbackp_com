class CookieConsent {
  constructor() {
    this.cspEventsList = ['load', 'updateDeclineAll', 'updateAcceptAll', 'updateSelected', 'deleteConsent'];
    this.consentsList = ['necessary', 'personalization', 'statistics', 'marketing', 'social'];

    this.params = this.getURLParams();
    this.uid = this.gen_random_uid(100);
  }

  run_program() {
    this.postToParent_message('consents iframe has loaded');
    if (this.params !== null) {
      if (this.params.csp_event === 'load') {
        const consents = this.getConsent();
        if (consents !== null) {
          this.postToParent_message('consents return', consents);
        } else {
          this.postToParent_message('consents request');
        }
      } else if (this.params.csp_event === 'updateDeclineAll') {
        this.setConsent([], this.consentsList);
      } else if (this.params.csp_event === 'updateAcceptAll') {
        this.setConsent(this.consentsList, []);
      } else if (this.params.csp_event === 'updateSelected') {
        this.setConsent(this.params.consents_approved, this.params.consents_denied);
      } else if (this.params.csp_event === 'deleteConsent') {
        this.deleteConsent();
      } else {
        /* consents invalid message */
        console.log('consents: invalid message');
      }
    } else {
      /* consents invalid URL params */
      console.log('consents: invalid URL params');
    }
  }

  postToParent_message(m, c = {}) {
    const messageObj = { message: m, consents: c };
    window.parent.postMessage(messageObj, this.params.referrer_url);
  }

  setConsent(consentsApproved = [], consentsDenied = []) {
    const consents = {
      csp_id: this.params.csp_id,
      csp_websites: this.params.csp_websites,
      exp_days: this.params.exp_days,
      exp_datetime: this.params.exp_datetime,
      timestamp: this.params.timestamp,
      consents_approved: consentsApproved,
      consents_denied: consentsDenied,
      uid: this.uid,
      consent_domain: this.params.referrer_domain,
    };

    this.setCookie(this.params.consent_name, JSON.stringify(consents), this.params.exp_days);
    this.postToParent_message('consents set', consents);
  }

  getConsent() {
    /* Get consent. Returns null if error in dictionary or the variable does not exist */
    let consents = null;
    try {
      consents = this.getCookie(this.params.consent_name);
      consents = JSON.parse(consents);
      consents = this.validateParams(consents);

      if (this.params.exp_datetime < this.params.timestamp) {
        consents = null;
      }
    } catch (err) { /* empty */ }

    return consents;
  }

  deleteConsent() {
    this.setCookie(this.params.consent_name, '', 0);
    this.postToParent_message('consents delete');
  }

  setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = ''.concat('expires=', d.toUTCString());
    document.cookie = ''.concat(cname, '=', cvalue, ';', expires, ';path=/;SameSite=None;Secure');
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

  getURLParams() {
    /*
    Get url parameters and validate. ,
    Returns an object params with value null if any param is missing or invalid
    */
    let params = {};

    try {
      const url = new URL(document.location.href); // parameters appended to iframe url
      const referrer = new URL(url.searchParams.get('referrer')); // url

      params.referrer_url = referrer.href;
      params.referrer_domain = referrer.host;

      params.csp_id = url.searchParams.get('csp_id'); // consent group id
      params.consent_name = ''.concat('consent_', params.csp_id);
      params.csp_websites = JSON.parse(url.searchParams.get('csp_websites')); // consent group websites
      params.csp_event = url.searchParams.get('csp_event'); // event

      params.exp_days = parseInt(url.searchParams.get('exp_days'), 10); // consent expiration date in days
      params.timestamp = new Date().getTime();
      params.exp_datetime = params.timestamp + (86400000 * params.exp_days);

      params.consents_approved = JSON.parse(url.searchParams.get('consents_approved') || '[]');
      params.consents_denied = JSON.parse(url.searchParams.get('consents_denied') || '[]');
      params = this.validateParams(params, 'urlparams');
    } catch (err) {
      params = null;
    }
    return params;
  }

  validateParams(params, type) {
    let tempParams = params;
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(tempParams)) {
        if (key === 'consents_approved' || key === 'consents_denied' || key === 'csp_websites') {
          if (Array.isArray(value) !== true) {
            tempParams = null;
            break;
          }
        } else if (key === 'exp_days' || key === 'timestamp' || key === 'exp_datetime') {
          if (Number.isInteger(value) !== true) {
            tempParams = null;
            break;
          }
        } else if (key === 'csp_event') {
          if (this.cspEventsList.includes(value) !== true) {
            tempParams = null;
            break;
          }
          if (tempParams.csp_event === 'updateSelected') {
            const tempConsentsList = tempParams.consents_approved.concat(tempParams.consents_denied);
            if (this.equalsIgnoreOrder(this.consentsList, tempConsentsList) !== true) {
              tempParams = null;
              break;
            }
          }
        } else if (typeof value !== 'string') {
          tempParams = null;
          break;
        }
      }
      
      // Only share consent if param referrerDomain exists in param cspWebsites
      if (type === 'urlparams') {
        if (tempParams.csp_websites.includes(tempParams.referrer_domain) !== true) {
          tempParams = null;
        }
      }
    } catch (err) {
      tempParams = null;
    }

    return tempParams;
  }

  equalsIgnoreOrder(a, b) {
    if (a.length !== b.length) { return false; }
    const uniqueValues = new Set([...a, ...b]);
    for (const v of uniqueValues) {
      const aCount = a.filter((e) => e === v).length;
      const bCount = b.filter((e) => e === v).length;
      if (aCount !== bCount) return false;
    }
    return true;
  }
}

const consentInstance = new CookieConsent();
consentInstance.run_program();
