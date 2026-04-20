((pid, dL) => {
    const w = window,
        d = document,
        s = 'script',
        b = `https://sbackp.com/tms.js?pid=${pid}&dl=${dL}`,       
        t = d.head || d.getElementsByTagName('head')[0] || d.documentElement,
        script = d.createElement(s);
    
    w[dL] = w[dL] || [];
    script.async = true;
    script.src = b;
    
    t.appendChild(script);
})('TESTPROFILEID', 'tmsDL');
