const APAC_LIST         = require('../athena/GBS_APAC_HITLIST')
const setPriority       = require('../athena/set_priority')


async function  extract(detail){
    const priority = detail.priority
    const order_id = detail.id
    const adv_id = require('./adv_id')(detail)
    console.log(`${order_id }, Adv_id=${adv_id} Priority = ${priority}`)

    let gbsPriority = 3
    if(APAC_LIST.hasOwnProperty(adv_id)) {
        let hitlistPriority = APAC_LIST[adv_id].priority
        console.log(`${hitlistPriority} ${gbsPriority}`)
        if(hitlistPriority < gbsPriority) {
            gbsPriority = hitlistPriority
        }
    }

    console.log(`GBS Priority = ${gbsPriority} Athena Priority = ${priority}`)
    if(priority !== gbsPriority) {
        await setPriority(order_id, gbsPriority)
        detail.priority = gbsPriority
    }

    return 'P' + gbsPriority
}


module.exports = extract
