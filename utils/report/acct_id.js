const adv2acct = require('../../Mapping/adv_2_acct')

function extract(adv_id){
    let acct_id = ''

    const id = adv_id.trim().split(',')[0] // Use the first adv id to check acct id
    // console.log(adv_id)
    // console.log(acct_id)
    acct_id = adv2acct[id]


    // console.log(adv2acct)

    return acct_id;
}


module.exports = extract
