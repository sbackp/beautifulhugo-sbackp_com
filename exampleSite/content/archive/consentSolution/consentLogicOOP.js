class CookieConsent {
  constructor() {
    this.params = this.getURLParams();
    this.uid = this.gen_random_uid(300);
  }

  run_program() {
    this.postToParent_message('consents iframe has loaded');
    // Only share consent if param referrerDomain exists in param cspWebsites

    if (this.params !== null) {
      if (this.params.csp_websites.includes(this.params.referrer_domain) === true) {
        if (this.params.csp_event === 'load') {
          console.log('getConsent');
          const consents = this.getConsent();
          console.log('consents!!');
          console.log(consents);
          if (consents !== null) {
            this.postToParent();
          } else {
            this.postToParent_message('request new consent');
          }
        } else if (this.params.csp_event === 'updateDeclineAll') {
          this.setConsent([], ['necessary', 'personalization', 'statistics', 'marketing']);
        } else if (this.params.csp_event === 'updateAcceptAll') {
          this.setConsent(['necessary', 'personalization', 'statistics', 'marketing'], []);
        } else if (this.params.csp_event === 'updateSelected') {
          this.setConsent(this.params.consents_approved, this.params.consents_denied);
        }
      }
    } else {
      console.log('params are invalid');
    }
  }

  setConsent(consentsApproved, consentsDenied) {
    const consentObj = {
      csp_id: this.params.csp_id,
      csp_websites: this.params.csp_websites,
      exp_days: this.params.exp_days,
      exp_datetime: this.params.exp_datetime,
      timestamp: this.params.timestamp,
      consents_approved: consentsApproved,
      consents_denied: consentsDenied,
      uid: this.uid,
      consent_url: this.params.referrer_url,
    };

    this.setCookie(this.params.consent_name, JSON.stringify(consentObj), this.params.exp_days);
    //localStorage.setItem(this.params.consent_name, JSON.stringify(consentObj));
    this.postToParent();

    return consentObj;
  }

  getConsent() {
    /* Get consent. Returns null if error in dictionary or the variable does not exist */
    let consents = null;
    try {
      consents = this.getCookie(this.params.consent_name);
      console.log('test getConsent2');
      console.log(consents);
      consents = JSON.parse(consents);
      console.log('test getConsent');
      console.log(consents);
      consents = this.validateConsentParams(consents);
      if (this.params.exp_datetime < this.params.timestamp) {
        consents = null;
      }
    } catch (err) { /* empty */ }

    return consents;
  }

  gen_random_uid(length) {
    /* Generate random ID */
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!';
    const charLength = chars.length;
    let result = '';
    for (let i = 0; i < length; i += 1) {
      result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
  }

  postToParent() {
    window.parent.postMessage(JSON.stringify(this.getCookie(this.params.consent_name)), this.params.referrer_url);
    // window.parent.postMessage(localStorage.getItem(this.params.consent_name), this.params.referrer_url);
  }

  postToParent_message(message) {
    window.parent.postMessage(message, this.params.referrer_url);
  }

   setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=None;Secure";
  }

  getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  getURLParams() {
    /*
    Get url parameters and validate. ,
    Returns an object params with value null if any param is missing or invalid
    */
    let params = {};

    const url = new URL(document.location.href); // parameters appended to iframe url
    const referrer = new URL(url.searchParams.get('referrer')); // url

    params.referrer_url = referrer.href;
    params.referrer_domain = referrer.host;

    params.csp_id = url.searchParams.get('csp_id'); // consent group id
    params.consent_name = 'consent_' + params.csp_id;
    params.csp_websites = JSON.parse(url.searchParams.get('csp_websites')); // consent group websites
    params.csp_event = url.searchParams.get('csp_event'); // event

    params.exp_days = parseInt(url.searchParams.get('exp_days'), 10); // consent expiration date in days
    params.timestamp = new Date().getTime();
    params.exp_datetime = params.timestamp + (86400000 * params.exp_days);

    params.consents_approved = JSON.parse(url.searchParams.get('consents_approved') || '[]');
    params.consents_denied = JSON.parse(url.searchParams.get('consents_denied') || '[]');

    params = this.validateConsentParams(params);

    return params;
  }

  validateConsentParams(params) {
    let tempParams = params;

    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(tempParams)) {
        if (key === 'csp_websites' || key === 'consents_approved' || key === 'consents_denied') {
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
          if (value !== 'load' && value !== 'updateDeclineAll' && value !== 'updateAcceptAll' && value !== 'updateSelected') {
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

const consentInstance = new CookieConsent();
consentInstance.run_program();
