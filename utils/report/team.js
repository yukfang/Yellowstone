const APAC_LIST = require('../athena/GBS_APAC_HITLIST')

function extract(adv_id){
     let team = ''

    if(APAC_LIST.hasOwnProperty(adv_id)) {
        return APAC_LIST[adv_id].team
    }

    return team;
}


module.exports = extract
