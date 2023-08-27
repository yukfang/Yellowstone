function extract(detail){
    const replies = detail.replies
    const pixel_reg =   /(.*)(\[pixel=(.*)\])(.*)/i
    let   pixelCode = ''

    const reg_exp = pixel_reg
    try {
        pixelCode = detail.items.filter(r=> r.label.includes('Pixel ID')).pop()?.content.toString() || "";
        if(pixelCode.trim().length !== "CA45I9RC77UFFUCCC3E0".length) {
            if(replies) {
                for(let k = 0; k < replies.length; k++) {
                    const reply = replies[k];
                    const items = reply.items.filter(x => x.type == 6);
        
                    for(let j = 0; j < items.length; j++) {
                        const item = items[j];
                        const matches = item.content.match(reg_exp)
                        if(matches) {
                            console.log(matches)
                            pixelCode = matches[3]
                        }
                    }
                }
            }
        }
    } catch( err) {
        console.log(err)
    }
    
    return pixelCode
}

function test() {
 
}

// test();

module.exports = extract
