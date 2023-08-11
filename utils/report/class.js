function extractClass(detail){
    const replies = detail.replies
    const class_reg =   /(.*)(\[class=(.*)\])(.*)/i
    let className = ''

    const reg_exp = class_reg
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                const matches = item.content.match(reg_exp)
                if(matches) {
                    className = matches[3]
                }
            }
        }
    }
    
    return (className === '')?'':(className+'班')
}

function test() {
 
}

// test();

module.exports = extractClass
