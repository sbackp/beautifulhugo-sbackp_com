(function consentsFunction() {
  /*
        INPUT:
        - referrer
        - consent group id
        - cspWebsites
        - expDays
        - cspEvent: load, updateDeclineAll, updateAcceptAll, updateSelected
          - if updateSelected: consentsApproved and consentsDenied

        LOGIC:
        - if event = load:
          - if consent_cookie exit for consent group id
            AND if url domain name in cookie cspWebsites
            AND if consent_cookie not expired
            - update cookie cspWebsites
            - return consent
          - else:
            - request new consent
        - else if event = updateDeclineAll | updateAcceptAll | updateSelected:
          - set consent
          - return consent
        - else:
          - do nothing

        OUTPUT:
        - set consent:
          - set localStorage variable named: 'consents_'+consent group id
          - LocalStorage variable value is stringified dictionary with parameters:
            - id: consent_group_id
            - websites: consent_group_websites
            - expDays: consent expiration date i days
            - expDatetime: consent expiration date
            - timestamp: consent datetime
            - consentsApproved: [marketing, statistik, personalization, necessary, social media]
            - consentsDenied: []
            - uid: unique consent id
            - consent_url
        - return consent
          - return 'consents_'+consent group id
    */

  function getURLParams() {
    /*
    Get url parameters and validate.
    Returns an object params with value null if any param is missing or invalid
    */
    let params = {};

    const url = new URL(document.location.href); // parameters appended to iframe url
    const referrer = new URL(url.searchParams.get('referrer')); // url

    params.cspId = url.searchParams.get('cspId'); // consent group id
    params.cspWebsites = JSON.parse(url.searchParams.get('cspWebsites')); // consent group websites
    params.referrerUrl = referrer.href;
    params.referrerDomain = referrer.host;
    params.expDays = parseInt(url.searchParams.get('expDays'), 10); // consent expiration date in days
    params.cspEvent = url.searchParams.get('cspEvent'); // event
    params.consentsApproved = JSON.parse(url.searchParams.get('consentsApproved') || '[]');
    params.consentsDenied = JSON.parse(url.searchParams.get('consentsDenied') || '[]');

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(params)) {
      if (key === 'cspWebsites' || key === 'consentsApproved' || key === 'consentsDenied') {
        if (Array.isArray(value) !== true) {
          params = null;
          break;
        }
      } else if (key === 'expDays') {
        if (Number.isInteger(value) !== true) {
          params = null;
          break;
        }
      } else if (key === 'cspEvent') {
        if (value !== 'load' && value !== 'updateDeclineAll' && value !== 'updateAcceptAll' && value !== 'updateSelected') {
          params = null;
          break;
        }
      } else if (typeof value !== 'string') {
        params = null;
        break;
      }
    }
    return params;
  }

  function getConsent(cspId) {
    /*
    Get consent. Returns null if error in dictionary or the variable does not exist
    */
    let consents = null;
    try {
      consents = JSON.parse(localStorage.getItem(`consent_${cspId}`));
      if (consents.expDatetime < new Date().getTime()) {
        consents = null;
      }
    } catch (err) { /* empty */ }

    return consents;
  }

  function postToParentRequestNewConsent(origin) {
    window.parent.postMessage('request new consent', origin);
  }

  function postToParent(cspId, origin) {
    window.parent.postMessage(localStorage.getItem(`consent_${cspId}`), origin);
  }

  function genRandomUid(length) {
    /* Generate random ID */
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    const charLength = chars.length;
    let result = '';
    for (let i = 0; i < length; i += 1) {
      result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
  }

  function setConsent(cspId, cspWebsites, expDays, consentsApproved, consentsDenied, referrerUrl) {
    const consentObj = {
      cspId,
      cspWebsites,
      expDays,
      expDatetime: new Date().getTime() + (86400000 * expDays),
      timestamp: new Date().getTime(),
      consentsApproved,
      consentsDenied,
      uid: genRandomUid(100),
      consent_url: referrerUrl,
    };

    localStorage.setItem(`consent_${cspId}`, JSON.stringify(consentObj));
    postToParent(cspId, referrerUrl);
  }

  // DECODE VALUES and VALIDATE
  const cspParams = getURLParams();

  if (cspParams !== null) {
    /* Not missing url params or invalid data type assigned to params */
    if (cspParams.cspWebsites.includes(cspParams.referrerDomain) === true) {
      /* the cspWebsites param contains the referrer domain */

      if (cspParams.cspEvent === 'load') {
        const consents = getConsent(cspParams.cspId);
        if (consents !== null) {
          postToParent(cspParams.cspId, cspParams.referrerUrl);
        } else {
          console.log('request new consent');
          postToParentRequestNewConsent(cspParams.referrerUrl);
        }
      } else if (cspParams.cspEvent === 'updateDeclineAll') {
        const consentsApproved = [];
        const consentsDenied = ['necessary', 'personalization', 'statistics', 'marketing'];
        setConsent(cspParams.cspId, cspParams.cspWebsites, cspParams.expDays, consentsApproved, consentsDenied, cspParams.referrerUrl);
      } else if (cspParams.cspEvent === 'updateAcceptAll') {
        const consentsApproved = ['necessary', 'personalization', 'statistics', 'marketing'];
        const consentsDenied = [];
        setConsent(cspParams.cspId, cspParams.cspWebsites, cspParams.expDays, consentsApproved, consentsDenied, cspParams.referrerUrl);
      } else if (cspParams.cspEvent === 'updateSelected') {
        setConsent(cspParams.cspId, cspParams.cspWebsites, cspParams.expDays, cspParams.consentsApproved, cspParams.consentsDenied, cspParams.referrerUrl);
      }
    } else {
      console.log('referrerDomain not in cspWebsites');
    }
  } else {
    console.log('cspParams are invalid');
  }
}());
