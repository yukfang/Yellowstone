function extract(detail){
    let adv_id = detail.items.filter(r=> r.label.includes('Ad Account ID')).pop().content.toString();
    if(detail.id == '1295031') {
        adv_id = '7221785686087581698' // In ticket it's 7025549290462314498 as wrong input
    }

   return adv_id;
}


module.exports = extract
