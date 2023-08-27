function extract(detail){
    const replies = detail.replies
    const status_update_reg   = /(.*)(\[status update\])(.*)/i

    let status_notes = ''

    const reg_exp = status_update_reg
    if(replies) {
        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const items = reply.items.filter(x => x.type == 6);
            const reply_time = (new Date(reply.create_time*1000)).toISOString().split('T')[0];

            for(let j = 0; j < items.length; j++) {
                const item = items[j];
                const status_update = item.content.match(status_update_reg)
                if(status_update) {
                    status_notes = `[${reply_time}]` + status_update[3]
                }
            }
        }
    } 
    status_notes =  status_notes
                    .replace(/<p>/g,      '').replace(/<\/p>/g,  '')
                    .replace(/<ul>/g,     '').replace(/<\/ul>/g, '')
                    .replace(/<br>/g,     '').replace(/<\/br>/g, '')
                    .replace(/<li>/g,     '').replace(/<\/li>/g, '')
                    .replace(/<ol>/g,     '').replace(/<\/ol>/g, '')
                    .replace(/<strong>/g, '').replace(/<\/strong>/g, '')
                    .replace(/<\/span>/g, '').replace(/(<span )(.*)(>)/g, ' ')
                    .replace(/&gt;/g, ">")
                    .replace(/&#39;/g, "'")
                    .replace(/&nbsp;/g, '')
    // console.log(status_notes)
    
    return status_notes
}

function test() {
 
}

// test();

module.exports = extract
