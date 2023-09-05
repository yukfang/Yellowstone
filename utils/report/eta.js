function extract(detail){
    const replies = detail.replies
    const reg =   /(.*?)(\[eta=(.*?)\])(.*?)/i
    let eta = ''

    const reg_exp = reg
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                const matches = item.content.match(reg_exp)
                if(matches) {
                    eta = matches[3]
                }
            }
        }
    }
    return eta
}

function test() {
 
}

// test();

module.exports = extract
