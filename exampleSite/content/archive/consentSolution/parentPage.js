(function consentsFunc() {
  // The values needed for the iframe to set or update consent
  const referrer = document.location.href;
  const cspWebsiteId = '123123'; // replace for each collection of websites
  const cspWebsites = JSON.stringify(['sbackp.com', 'sbackp.dk', 'tryg.dk']); // collection of websites
  const consentExpDays = 180; // get from onetrust setting
  const consentUrl = 'https://idyllic-kulfi-7c87be.netlify.app';
  let iframeLoaded = false;

  // Create the iframe to communicate with.
  const iframe = document.createElement('iframe');
  iframe.src = consentUrl + '?referrer=' + referrer + '&csp_id=' + cspWebsiteId + '&csp_websites=' + cspWebsites + '&exp_days=' + consentExpDays + '&csp_event=load';
  iframe.setAttribute('style', 'display:none !important;');
  document.body.appendChild(iframe);

  window.addEventListener('message', (event) => {
    // Verify the message's origin before trusting it.
    if (event.origin === consentUrl) {
      if (event.data === 'consents iframe has loaded') {
        console.log('consents iframe has loaded');
        iframeLoaded = true;
      }

      // Handle message from a valid domain.
      if (event.data === 'consents invalid URL params') {
        console.log('consents invalid URL params'); // Invalid URL params
      } else if (event.data === 'consents delete') {
        localStorage.removeItem('consent_' + cspWebsiteId); // Delete consent
      } else if (event.data === 'consents request') {
        document.getElementsByTagName('form')[0].setAttribute('style', 'display:block'); // show consent banner
      } else {
        document.getElementsByTagName('form')[0].setAttribute('style', 'display:none'); // do not show consent banner
        localStorage.setItem('consent_' + cspWebsiteId, event.data);
      }
    }
  });

  setTimeout(() => {
    if (iframeLoaded === false) {
      console.log('consents child have not responded within 0.5 second');
    }
  }, 500);

  /* REWRITE FOR ONETRUST */
  const updateDeclineAll = document.getElementById('updateDeclineAll');
  updateDeclineAll.addEventListener('click', (event) => {
    event.preventDefault();

    iframe.src = consentUrl + '?referrer=' + referrer + '&csp_id=' + cspWebsiteId + '&csp_websites=' + cspWebsites + '&exp_days=' + consentExpDays + '&csp_event=updateDeclineAll';
  });

  const updateAcceptAll = document.getElementById('updateAcceptAll');
  updateAcceptAll.addEventListener('click', (event) => {
    event.preventDefault();

    iframe.src = consentUrl + '?referrer=' + referrer + '&csp_id=' + cspWebsiteId + '&csp_websites=' + cspWebsites + '&exp_days=' + consentExpDays + '&csp_event=updateAcceptAll';
  });

  const updateSelected = document.getElementById('updateSelected');
  updateSelected.addEventListener('click', (event) => {
    event.preventDefault();

    // take from selection
    const consentsApproved = JSON.stringify(['necessary', 'marketing', 'functional']);
    const consentsDenied = JSON.stringify(['statistics']);

    iframe.src = consentUrl + '?referrer=' + referrer + '&csp_id=' + cspWebsiteId + '&csp_websites=' + cspWebsites + '&exp_days=' + consentExpDays + '&csp_event=updateSelected&consents_approved=' + consentsApproved + '&consents_denied=' + consentsDenied;
  });

  /* REWRITE FOR ONETRUST */
}());
