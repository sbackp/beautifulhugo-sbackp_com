class CookieConsentParent {
  constructor(cspWebsiteId, cspWebsites, consentExpDays) {
    this.referrer = document.location.href;
    this.cspWebsiteId = cspWebsiteId; // replace for each collection of websites
    this.consentName = ''.concat('consent_', cspWebsiteId);
    this.cspWebsites = JSON.stringify(cspWebsites); // collection of websites
    this.consentExpDays = consentExpDays; // get from onetrust setting
    this.consentUrl = 'https://idyllic-kulfi-7c87be.netlify.app';
    this.iframeLoaded = false;
    this.iframeId = 'iframename';
  }

  run_program() {
    this.createIframe();
    this.updateDeclineAll();
    this.updateAcceptAll();
    this.updateSelected();

    window.addEventListener('message', (event) => {
    // Verify the message's origin before trusting it.
      if (event.origin === this.consentUrl) {
        if (event.data.message === 'consents iframe has loaded') {
          this.iframeLoaded = true;
        } else if (event.data.message === 'consents invalid URL params') {
          /* invalid URL params */
        } else if (event.data.message === 'consents delete') {
          this.deleteConsent(this.consentName); // Delete consent
        } else if (event.data.message === 'consents request') {
          this.showConsentBanner(); // Request Consent
          this.deleteConsent();
        } else if (event.data.message === 'consents set' || event.data.message === 'consents return') {
          this.hideConsentBanner();
          this.setConsent(event.data.consents); // Consents Iframe returned Consent
        } else {
          /* Consents invalid message */
        }
      }
      else {
        /* Invalid origin */
      }
    });

    setTimeout(() => {
      if (this.iframeLoaded === false) {
        /* consents iframe has not responded within 2 seconds */
      }
    }, 2000);
  }

  showConsentBanner() {
    document.getElementsByTagName('form')[0].setAttribute('style', 'display:block'); // show consent banner
  }

  hideConsentBanner() {
    document.getElementsByTagName('form')[0].setAttribute('style', 'display:none'); // do not show consent banner
  }

  createIframe() {
    const iframe = document.createElement('iframe');
    iframe.id = this.iframeId;
    iframe.src = ''.concat(this.consentUrl, '?referrer=', this.referrer, '&csp_id=', this.cspWebsiteId, '&csp_websites=', this.cspWebsites, '&exp_days=', this.consentExpDays, '&csp_event=load');
    iframe.setAttribute('style', 'display:none !important;');
    document.body.appendChild(iframe);
  }

  getConsent() {
    let consent = null;
    try {
      consent = JSON.parse(this.getCookie(this.consentName));
    } catch (err) { /* empty */ }
    return consent;
  }

  setConsent(value) {
    this.setCookie(this.consentName, JSON.stringify(value), this.consentExpDays);
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

  /* REWRITE FOR ONETRUST */
  updateDeclineAll() {
    const updateDeclineAll = document.getElementById('updateDeclineAll');
    const iframe = document.getElementById(this.iframeId);
    updateDeclineAll.addEventListener('click', (event) => {
      event.preventDefault();
      iframe.src = ''.concat(this.consentUrl, '?referrer=', this.referrer, '&csp_id=', this.cspWebsiteId, '&csp_websites=', this.cspWebsites, '&exp_days=', this.consentExpDays, '&csp_event=updateDeclineAll');
    });
  }

  updateAcceptAll() {
    const updateAcceptAll = document.getElementById('updateAcceptAll');
    const iframe = document.getElementById(this.iframeId);
    updateAcceptAll.addEventListener('click', (event) => {
      event.preventDefault();
      iframe.src = ''.concat(this.consentUrl, '?referrer=', this.referrer, '&csp_id=', this.cspWebsiteId, '&csp_websites=', this.cspWebsites, '&exp_days=', this.consentExpDays, '&csp_event=updateAcceptAll');
    });
  }

  updateSelected() {
    const updateSelected = document.getElementById('updateSelected');
    const iframe = document.getElementById(this.iframeId);
    updateSelected.addEventListener('click', (event) => {
      event.preventDefault();

      // take from selection
      const consentsApproved = JSON.stringify(['necessary', 'marketing', 'personalization']);
      const consentsDenied = JSON.stringify(['statistics', 'social']);
      iframe.src = ''.concat(this.consentUrl, '?referrer=', this.referrer, '&csp_id=', this.cspWebsiteId, '&csp_websites=', this.cspWebsites, '&exp_days=', this.consentExpDays, '&csp_event=updateSelected', '&consents_approved=', consentsApproved, '&consents_denied=', consentsDenied);
    });
  }
}

const ConsentParentInstance = new CookieConsentParent('987654', ['sbackp.dk', 'sbackp.com', 'tryg.dk'], 180);
ConsentParentInstance.run_program();
