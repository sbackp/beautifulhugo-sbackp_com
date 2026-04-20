(() => {
    const currentScript = document.currentScript;
    if (!currentScript || !currentScript.src) {
        console.error('TMS: Unable to determine script source');
        return;
    }

    // Parse the profile ID from the script src URL
    const url = new URL(currentScript.src);
    const profileId = url.searchParams.get('pid');
    
    if (!profileId) {
        console.error('TMS: Profile ID (pid) parameter not found in script URL');
        return;
    }

    console.log('TMS: Initializing with Profile ID:', profileId);
    console.log('TMS: Script URL:', currentScript.src);
    console.log('TMS: Current page:', document.location.href);
    
    // Your TMS initialization logic here using the profileId
    // Example: Load configuration based on profileId
    // initializeTMS(profileId);
})();
