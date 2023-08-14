function extract(detail){
    const owner_name = detail.owner_name;

    const replies = detail.replies
    const sales_reg =   /(.*)(\[sales=(.*)\])(.*)/i
    const cst_reg   =   /(.*)(\[cst=(.*)\])(.*)/i
    let sales = ''
    let cst = ''
 
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                {
                    const matches = item.content.match(sales_reg)
                    if(matches) {
                        sales = matches[3]
                    }
                }
                {
                    const matches = item.content.match(cst_reg)
                    if(matches) {
                        cst = matches[3]
                    }
                }
            }
        }
    }

    return {sales, cst};
}

module.exports = extract
