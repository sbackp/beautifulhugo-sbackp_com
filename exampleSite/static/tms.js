function getProfileId() {
    const currentScript = document.currentScript;
    if (!currentScript || !currentScript.src) {
        console.error('TMS: Unable to determine script source');
        return null;
    }

    const url = new URL(currentScript.src);
    const profileId = url.searchParams.get('pid');
    
    if (!profileId) {
        console.error('TMS: Profile ID (pid) parameter not found in script URL');
        return null;
    }

    return profileId;
}

((dl, pid) => {
    function injectTag(url, id) {
        const s = document.createElement('script');
        s.src = url;
        s.id = id;
        s.async = true;
        s.onload = () => console.log(`Tag ${id} loaded`);
        s.onerror = () => console.error(`Tag ${id} failed to load`);
        document.head.appendChild(s);

        console.log(`TMS: Injected tag ${id} with URL ${url}`);
    }

    function processEvent(event) {
        tmsConfigs.tags.forEach(tag => {
            if (tag.triggger.event === event.event) {
                injectTag(tag.url, tag.id);
            }
        });
    }

    const tmsConfigs = {
        tags: [{
            'id': 'tms001',
            'url': 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID',
            'triggger': {
                event: 'pageview'
            }
        }]
    };
    
    // Listen for dataLayer events
    const w = window;
    w[dl] = w[dl] || [];
    const originalPush = w[dl].push;
    w[dl].push = function() {
        // add timestamp to the pushed event
        Object.assign({ 'tms.event.ts': new Date().getTime() }, arguments[0]);
        originalPush.apply(w[dl], arguments);
        processEvent(arguments[0]);
    };

    // Initialize: Process any existing events
    window.tmsDL.forEach(event => { 
        processEvent(event);
    });
    
    // Your TMS initialization logic here using the profileId
    // Example: Load configuration based on profileId
    // initializeTMS(profileId);
})('tmsDL', getProfileId());
