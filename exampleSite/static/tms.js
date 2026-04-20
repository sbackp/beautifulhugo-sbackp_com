const tmsConfigs = {
        tags: [{
                'id': 'tms001',
                'url': 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID',
                'trigger': { event: 'pageview' }
            },
            {
                'id': 'tms002',
                'script': 'https://connect.facebook.net/en_US/fbevents.js',
                'trigger': { event: 'purchase' }
            }]
    };

function getTMSParams() {
    try {
        const currentScript = document.currentScript;
        if (currentScript && currentScript.src) {
            const url = new URL(currentScript.src);
            const params = {};
            params.pid = url.searchParams.get('pid');
            params.dL = url.searchParams.get('dL');

            if (params.pid && params.dL) {
                return params;
            } else {
                return {};
            }
        }
    } catch (error) {
        return {};
    }
}

function initializeTMS(dL, tmsConfigs) {
    const injectTag = (url, id) => {
        const s = document.createElement('script');
        s.src = url;
        s.id = id;
        s.async = true;
        document.head.appendChild(s);
    }

    const processEvent = (event) => {
        tmsConfigs.tags.forEach(tag => {
            if (tag.trigger.event === event.event) {
                injectTag(tag.url, tag.id);
            }
        });
    }

    // Listen for dataLayer events
    const w = window;
    w[dL] = w[dL] || [];
    const originalPush = w[dL].push;
    w[dL].push = function() {
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
const { pid, dL } = getTMSParams();
console.log(`TMS: ${dL}`);
initializeTMS(dL, tmsConfigs);
