
const REGION_MAPPING = {
    /** EUI */
    "EU-DE" :   "EUI",
    "EU-GB" :   "EUI",
    "EU-IT" :   "EUI",
    "EU-FR" :   "EUI",

    /** METAP */
    "MENA-AE" : "METAP",


    /** NA */
    "NORTH AMERICA" : "NA",

    /** LATAM */
    // "LATAM-BR"      : "LATAM",
    // "LATAM-MX"      : "LATAM",

    /**APAC */
    "Japan"     :  "APAC",
    "JP"        :  "APAC",
    "KR"        :  "APAC",
    "AU"        :  "APAC",

    "SEA-KR"        :  "APAC",
    "SEA-AU"        :  "APAC",
    "SEA-ID"        :  "APAC",
    "OUTBOUND-HK"   :  "APAC",

    /** CNOB */
    "OUTBOUND-CN"   : "CNOB"
}
function extractRegion(country){

    let region = country
    if(REGION_MAPPING.hasOwnProperty(country)) {
        region = REGION_MAPPING[country]
    } else if(country.includes("EU-")) {
        region = "EUI"
    } else if (country.includes("MENA-")) {
        region = "METAP"
    } else if (country.includes("SEA-")) {
        region = "APAC"
    } else if (country.includes("AU")) {
        region = "APAC"
    } else if( country.includes("NORTHAMERICA-")) {
        region = "NA"
    } else if (country.includes("LATAM-")) {
        region = "LATAM"
    } else if (country.includes("OUTBOUND-")) {
        region = "CNOB"
    }
    
    return region;
}

function test() {
 
}

// test();

module.exports = extractRegion
