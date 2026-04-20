function getTMSParams() {
    const params = {};
    
    const currentScript = document.currentScript;
    if (!currentScript || !currentScript.src) {
        console.error('TMS: Unable to determine script source');
        return {};
    }

    const url = new URL(currentScript.src);
    params.pid = url.searchParams.get('pid');
    params.dl = url.searchParams.get('dl');

    if (!params.pid) {
        console.error('TMS: Profile ID (pid) parameter not found in script URL');
        return {};
    }
    if (!params.dl) {
        console.error('TMS: Data layer name (dl) parameter not found in script URL');
        return {};
    }

    return params;
}

function initializeTMS(dl) {
    const injectTag = (url, id) => {
        const s = document.createElement('script');
        s.src = url;
        s.id = id;
        s.async = true;
        s.onload = () => console.log(`Tag ${id} loaded`);
        s.onerror = () => console.error(`Tag ${id} failed to load`);
        document.head.appendChild(s);

        console.log(`TMS: Injected tag ${id} with URL ${url}`);
    }

    const processEvent = (event) => {
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
        },
            {
                id: 'facebook-pixel',
                script: 'https://connect.facebook.net/en_US/fbevents.js',
                trigger: { event: 'purchase' }
            }]
    };
    
    // Listen for dataLayer events
    const w = window;
    w[dl] = w[dl] || [];
    const originalPush = w[dl].push;
    w[dl].push = function() {
        // add timestamp to the pushed event
        Object.assign(arguments[0], { 'tms.event.ts': new Date().getTime() });
        originalPush.apply(w[dl], arguments);
        processEvent(arguments[0]);
    };

    // Initialize: Process any existing events
    w[dl].forEach(event => { 
        processEvent(event);
    });
}

// Your TMS initialization logic here using the profileId
const { pid, dl } = getTMSParams();
if (pid && dl) {
    console.log(`TMS: Initializing with profile ID ${pid}`);

    // Example: Load TMS configuration based on TMS profile ID (pid)

    // For demonstration, we will call initializeTMS with the data layer name from the script URL
    if (dl) {
        initializeTMS(dl);
    }
}
