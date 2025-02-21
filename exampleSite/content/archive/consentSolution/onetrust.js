
let b = {};
let u = {};
u.data = {
    /* Initialize default tag parameter values here */
    /* Examples: */
    /* "account_id" : "1234567" */
    "base_url": "https://cdn.cookielaw.org/consent/ea1a40ca-a25d-43c5-b96a-fc66e962adac-test/otSDKStub.js",
    "data_domain_script": "ea1a40ca-a25d-43c5-b96a-fc66e962adac-test",
    "custom_svg": ""
    /* A value mapped to "account_id" or "base_url" in TiQ will replace these default values. */
};



/* Start Tag Sending Code */

// Insert your tag sending code here.
if (!window.OneTrust && typeof (u.data['base_url']) === 'string' && u.data['base_url'] !== '' && typeof (u.data['data_domain_script']) === 'string' && u.data['data_domain_script'] !== '') {
    (function (a, b, c, d) {
        a = u.data['base_url'];
        b = document;
        c = 'script';
        d = b.createElement(c);
        d.src = a
        d.setAttribute("data-domain-script", u.data['data_domain_script']);
        d.type = 'text/java' + c;
        d.async = true;
        a = b.getElementsByTagName(c)[0];
        a.parentNode.insertBefore(d, a);
    })();

    window.OptanonWrapper = function () {
        function ot_insert_brand_image(imagePath, imageType) {
            let ot_pc_logo = document.querySelectorAll('#onetrust-pc-sdk .ot-pc-logo');
            if (imagePath && imageType === 'svg' && ot_pc_logo.length > 0) {
                ot_pc_logo[0].role = imageType;
                ot_pc_logo[0].innerHTML = imagePath;
            }
        }
        function r() {
            let update_button = document.querySelectorAll('#onetrust-pc-sdk .save-preference-btn-handler');
            let checkboxes = document.querySelectorAll("#onetrust-pc-sdk input[type='checkbox'].category-switch-handler");
            let checkboxes_length = checkboxes.length;

            for (var i = 0; i <= checkboxes.length - 1; i++) {
                if (checkboxes[i].checked === true) {
                    checkboxes_length -= 1
                }
            }

            if (checkboxes_length === 0 || checkboxes_length === checkboxes.length) {
                update_button[0].setAttribute('style', 'display: none !important;');
            } else {
                update_button[0].setAttribute('style', 'display: inline-block !important;');
            }
        }

        function e() {
            let allow_all_cookies_btn = document.querySelectorAll("#onetrust-pc-sdk #accept-recommended-btn-handler");
            let btn_container = document.querySelectorAll("#onetrust-pc-sdk .ot-btn-container");
            if (allow_all_cookies_btn.length > 0 && btn_container.length > 0) {
                btn_container[0].append(allow_all_cookies_btn[0]);
            }

            let ot_pc_logo = document.querySelectorAll('#onetrust-pc-sdk .ot-pc-logo');
            if (u.data['custom_svg'] !== '' && ot_pc_logo.length > 0) {
                ot_insert_brand_image(imagePath = u.data['custom_svg'], imageType = 'svg');
            }

            /* Hide Allow selection */
            r();

            // add event listeners
            let ot_cat_grp_input = document.querySelectorAll('#onetrust-pc-sdk .ot-cat-grp input.category-switch-handler');
            if (ot_cat_grp_input.length > 0) {
                for (var i = 0; i <= ot_cat_grp_input.length - 1; i++) {
                    ot_cat_grp_input[i].addEventListener('click', r, false);
                }
            }
            /* Hide Allow selection END */
        }

        /* REMOVE iframe !
        let my_test = document.querySelectorAll('#onetrust-pc-sdk .ot-text-resize');
        if (my_test.length > 0) {
            my_test[0].parentNode.removeChild(my_test[0]);
        }
         REMOVE iframe END*/

        // if crossSiteConsent does not exist
        if (Optanon.IsAlertBoxClosed() === false) {
            Optanon.ToggleInfoDisplay();
            e();
        } else { // if crossSiteConsent does exist
            e();
        }

        Optanon.OnConsentChanged(function () {
            console.log('Onetrust trigger - new consent');

            //send consent to iframe


            //Identity consent events. Is used to trigger tags on cookie consent events
            if (Array.isArray(b.custom_event) === true) {
                if (b['custom_event'].includes('cookie_consent_given') === false) {
                    b["custom_event"].push("cookie_consent_given");
                }
            } else {
                b["custom_event"] = ["cookie_consent_given"];
            }

            let cookie_consents_approved_onetrust = [],
                cookie_consent_necessary_bool_onetrust = false,
                cookie_consent_statistical_bool_onetrust = false,
                cookie_consent_personalization_bool_onetrust = false,
                cookie_consent_marketing_bool_onetrust = false;

            if (OnetrustActiveGroups.indexOf('C0001') > -1) {
                cookie_consent_necessary_bool_onetrust = true;
                cookie_consents_approved_onetrust.push('cookie_cat_necessary');
            }
            if (OnetrustActiveGroups.indexOf('C0002') > -1) {
                cookie_consent_statistical_bool_onetrust = true;
                cookie_consents_approved_onetrust.push('cookie_cat_statistic');
            }
            if (OnetrustActiveGroups.indexOf('C0003') > -1) {
                cookie_consent_personalization_bool_onetrust = true;
                cookie_consents_approved_onetrust.push('cookie_cat_functional');
            }
            if (OnetrustActiveGroups.indexOf('C0004') > -1) {
                cookie_consent_marketing_bool_onetrust = true;
                cookie_consents_approved_onetrust.push('cookie_cat_marketing');
            }

            b.cookie_consent_necessary_bool = cookie_consent_necessary_bool_onetrust;
            b.cookie_consent_statistical_bool = cookie_consent_statistical_bool_onetrust;
            b.cookie_consent_personalization_bool = cookie_consent_personalization_bool_onetrust;
            b.cookie_consent_marketing_bool = cookie_consent_marketing_bool_onetrust;
            b.cookie_consents_approved = cookie_consents_approved_onetrust;

            utag.view(b, false);
        });
    }
}