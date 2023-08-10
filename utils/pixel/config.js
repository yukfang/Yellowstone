const proxying = require('../http/proxying');

async function get_pixel_config(pixel_id){

    const endpoint  = `https://analytics.tiktok.com/i18n/pixel/config.js?sdkid=${pixel_id}`;
    const method    = 'GET';
    let header      = {  }
    let param       = {  }
    let body        = null;

    const response = (await proxying(method, endpoint, header, param, body, true));
    // console.log(response.data)

    if(response && response.status == 200 ) {
        // const aam_reg =  /(.*)(auto_email)()(:)(true)(.*)/i
        const aam_reg = /.+"auto_email":true.+/i;
        const aam_enable = response.data.match(aam_reg) ? "Yes" : "No"

        const cookie_reg = /.+enableFirstPartyCookie\(true\).+/i
        const cookie_enable = response.data.match(cookie_reg) ? "Yes" : "No"

        // console.log(`${aam_enable} ${cookie_enable}`)
        return {
            aam_enable, cookie_enable
        }

    } else {
        return {}
    }
 }

async function test() {
    const pixel_id = `C44VHJ4787TERR106Q60`
    const config = await get_pixel_config(pixel_id);
    console.log(config)


    const str = 'window[window["TiktokAnalyticsObject"]].instance("C44VHJ4787TERR106Q60").setAdvancedMatchingAvailableProperties({"email":true,"phone_number":true,"auto_email":true,"auto_phone_number":true}); \
    window[window["TiktokAnalyticsObject"]].instance("C44VHJ4787TERR106Q60").setPixelInfo && window[window["TiktokAnalyticsObject"]].instance("C44VHJ4787TERR106Q60").setPixelInfo({status: 0, name: "emmiol20210804", advertiserID: "6977198126851489794", setupMode: 1, partner: "", is_onsite: false }); \
    window[window["TiktokAnalyticsObject"]].setPCMDomain && window[window["TiktokAnalyticsObject"]].setPCMDomain(""); \
    window[window["TiktokAnalyticsObject"]].setPCMConfig && window[window["TiktokAnalyticsObject"]].setPCMConfig(null); \
    window[window["TiktokAnalyticsObject"]].enableFirstPartyCookie && window[window["TiktokAnalyticsObject"]].enableFirstPartyCookie(true);';
    const regex = /.+"auto_email":true.+/;
    
    if (str.match(regex)) {
        console.log('Match found!');
    } else {
        console.log('No match.');
    }
    

    // console.log(response)
}

// test();

module.exports = get_pixel_config
