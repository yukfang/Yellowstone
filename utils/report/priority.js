const APAC_LIST         = require('../athena/GBS_APAC_HITLIST')
const setPriority       = require('../athena/set_priority')


const apac_p0_tickets = [
1295164,
1613354,
1618215,
1595641,
1473730,
1317733,
1295133,
1291914,
1532634,
1590988,
1317772,
1326710,
1569677,
1618215,
1470915,
1223701,
1562725,
1326850,
1292100,
1625621,
1595377,
1317884,
1370994,
1326331,
1292779,
1631998,
1624403,
]


async function  extract(detail, region){

    if(region !== "APAC") {
        return 'P' + detail.priority
    }

    if(region == "APAC") {
        if( apac_p0_tickets.includes(detail.id)) {
            console.log(`this is apac p0`)
            return 'P0'
        } else {
            return 'P1'
        }
    }

    const priority = detail.priority
    const order_id = detail.id
    const adv_id = require('./adv_id')(detail)
    // console.log(`${order_id }, Adv_id=${adv_id} Priority = ${priority}`)

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
