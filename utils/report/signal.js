function extract(detail){
    const replies = detail.replies
    const pixel_reg  =   /(.*)(\[pixel_optimal=(.*)\])(.*)/i
    const eapi_reg   =   /(.*)(\[eapi_optimal=(.*)\])(.*)/i
    let pixel_o = 'no'
    let eapi_o  = 'no'
 
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                {
                    const matches = item.content.match(pixel_reg)
                    if(matches) {
                        pixel_o = matches[3]
                    }
                }
                {
                    const matches = item.content.match(eapi_reg)
                    if(matches) {
                        eapi_o = matches[3]
                    }
                }
            }
        }
    }

    return {pixel_o, eapi_o};
}

module.exports = extract
