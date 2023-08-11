function extractCountry(detail){
    const regionLables = [
        'Region', 'Country / Region', 'Client Region', 'Country/Region', 'GBS Country/Region', "GBS Country / Region"
    ]
    let country = detail.items.filter(r => regionLables.includes(r.label)).pop().content;
    if(country.toLowerCase().includes("-au")) {
        country = "AU"
    } else if(country.toLowerCase().includes('-hk')) {
        country = 'SEA-HK'
    }  else if(country.toLowerCase().includes('taiwan')) {
        country = 'SEA-TW'
    } else if(country.toLowerCase().includes('-kr')) {
        country = 'KR'
    } else if(country.toLowerCase().includes('japan')) {
        country = 'JP'
    } else if(country.toLowerCase().includes('-jp')) {
        country = 'JP'
    }

    /** Adjust wrong country */
    if(`${detail.id}` === '1326137') {
        country = "SEA-SG"
    }  else if(['1350595', '1350588', '1350590', '1350576'].includes(`${detail.id}`)) {
        country = "SEA-SG"
    }   
    else {
    }

    // Search comments for [country=]
    const replies = detail.replies
    const reg_exp = /(.*)(\[country=(.*)\])(.*)/i
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                const matches = item.content.match(reg_exp)
                if(matches) {
                    country = matches[3]
                }
            }
        }
    }
    
    return country;
}

function test() {
 
}

// test();

module.exports = extractCountry
