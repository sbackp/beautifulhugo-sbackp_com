---
title: Iframe Test - Parent page!
date: 2023-02-10
---



<h1 id="title">Parent Site</h1>
  <div>
    <h3>Data received from <em id="messageOrigin">...</em>:</h3>
    <pre id="dataRetrieved"></pre>
  </div>

  <div id="iframeContainer">
    <h3>iFrame from other site (would likely be hidden in a real product):</h3>
  </div>


  <div id="otherParentLink"></div>

  <script>
    (function () {
      // Create the iframe to communicate with.
      var iframeContainer = document.getElementById('iframeContainer');
      var iframe = document.createElement('iframe');
      iframe.src='https://idyllic-kulfi-7c87be.netlify.app/';
      iframe.width='500';
      iframe.height='100';
      iframeContainer.appendChild(iframe);

      window.addEventListener('message', function (event) {
        // Verify the message's origin before trusting it.
        if (event.origin !== 'https://idyllic-kulfi-7c87be.netlify.app') {
          // Handle message from an evil domain.
          alert('Message event received from bad origin');
        }
        else {
          // Handle message from a valid domain.
          document.getElementById('dataRetrieved').textContent = event.data;
          document.getElementById('messageOrigin').textContent = event.origin;
        }
      });
    })();

    (function () {
      var title = document.getElementById('title');
      var otherParentLink = document.getElementById('otherParentLink');
      var isGood = window.location.host === 'https://sbackp.com';
      title.textContent = (isGood ? '' : 'Evil ') + 'Parent Site'
      otherParentLink.innerHTML = [
        '<a href="http://',
        isGood ? 'evil-' : '',
        'sbackp.com">Try ',
        isGood ? 'Evil' : 'Good',
        ' Parent</a>'
      ].join('');
    })();
  </script>
