const fs = require('fs');

const TAGS_MAPPING = {
    "Open Status"                       : "Open",
    "Closed  - No Adoption Improvement" : "C-NoAdoption",
}

const CACHE_DIR = (process.env.PLATFORM == 'FAAS')?'../order_platform/':'./order_platform/'
const clock =0
async function generateDataSnapshot(orders) {
    /** 1. Get Order Details */
    const detailFiles = await fs.readdirSync(`${CACHE_DIR}detail/`, { withFileTypes: true }, function (err) {console.log(err)} );
    // console.log(detailFiles)

    const orderInfo = []
    for(let i = 0 ; i < detailFiles.length; i++) {
        const detail =  await ((f)=>{
            return new Promise((resolve) => {
                resolve(JSON.parse(fs.readFileSync(f, {encoding:'utf8', flag:'r'})))
            }).catch(err=>{
                console.log('JSON Parse error ' + err)
            })
        })(`${CACHE_DIR}detail/${detailFiles[i].name}`)

        const tag =  await ((f)=>{
            return new Promise((resolve) => {
                resolve(JSON.parse(fs.readFileSync(f, {encoding:'utf8', flag:'r'})))
            }).catch(err=>{
                console.log('JSON Parse error ' + err)
            })
        })(`${CACHE_DIR}tag/${detailFiles[i].name}`)

        detail.tag = tag         // Append tag to detail

        orderInfo.push(detail)
    }
    
    /** 2. Generate Snapshot */
    const orderDataList = []
    /** 0. Construct Data */
    for(let i = 0; i < orderInfo.length; i++) {
        const order = orderInfo[i]

        const id = order.id 
        const follower = order.follower
        const archive_category_1_name = order.archive_category_1_name
        const priority = order.priority

        const regionLables = [
            'Region',
            'Country / Region',
            'Client Region',
            'Country/Region',
            'GBS Country/Region',
            "GBS Country / Region", 
        ]
        const region =  order.items.filter(r => regionLables.includes(r.label)).pop().content;

        // Create/Close Time
        const create_time = order.create_time * 1000
        const update_time = order.update_time * 1000
        const pending_time = order.pending_time 
        const close_time  = (order.status === 3) ?  update_time : 0

        // Status
        const status = order.status

        // Advertiser / Client Name
        const client_name = ''
        try{
            client_name = order.items.filter(r=> r.label.includes('Client Name') || r.label.includes('Advertiser name')).pop().content;
        } catch(err) {}
    
        // ADV_ID
        const adv_id = order.items.filter(r=> r.label.includes('Ad Account ID')).pop().content.toString();


        // Tags
        let tags      = ''
        let sub_tags  = ''
        const orderTag = order.tag 
        if(orderTag === null || orderTag === undefined) {
            console.log(`${order.id} tag null`)
        } else if (Object.keys(orderTag).length === 0 ) { // {} 
            console.log(`${order.id} tag {}`)
        } else {
            // console.log(`orderTag: ${order.id}`)
            const rawTags = []
            orderTag.forEach(e => {
                rawTags.push(e)
            })

            if(rawTags.length !== 1) {
                tags = "!!!ERR"
            } else {
                tags = rawTags[0].name
                if(rawTags[0].sub_tags.length > 1) {
                    sub_tags = "!!!ERR"
                } else {
                    sub_tags = rawTags[0].sub_tags[0]?.name
                }
            }
        }


        // Case Notes
        const replies = order.replies;
        let notes = []
        if(replies) {
            let note1 = '';
            let note2 = '';
            const note_reg = /(.*)(\[status update\])(.*)/i

            for(let k = 0; k < replies.length; k++) {
                const reply = replies[k];
                const reply_time = (new Date(reply.create_time*1000)).toISOString().split('T')[0];
                const items = reply.items.filter(x => x.type == 6);

                for(let j = 0; j < items.length; j++) {
                    const item = items[j];
                    let note_matches = item.content.match(note_reg);
                    if(note_matches) {
                        note1 = note2;
                        note2 = `[${reply_time}]` + note_matches[3]
                    } else {
                    }
                }
            }
            // console.log(`replacing all aaaa`)
            notes = [note1, note2].map( 
                n => n
                .replace(/<p>/g,      "").replace(/<\/p>/g, "")
                .replace(/<ul>/g,     '').replace(/<\/ul>/g, '')
                .replace(/<br>/g,     '').replace(/<\/br>/g, '')
                .replace(/<li>/g,     '').replace(/<\/li>/g, '')
                .replace(/<ol>/g,     '').replace(/<\/ol>/g, '')
                .replace(/<strong>/g, '').replace(/<\/strong>/g, '')
                .replace(/<\/span>/g, '').replace(/(<span )(.*)(>)/g, ' ')
                .replace(/&gt;/g, ">")
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, '')
            )
        } else {
            // console.log('no replies')
        }

        const rec= {
            id, follower, 
            archive_category_1_name, priority, 
            create_time, close_time, update_time, pending_time, 
            region,
            tags, sub_tags,
            status, client_name, adv_id,  notes
        }

        orderDataList.push(rec)
    }

    /** Save Constructed Data to Local File */
    fs.writeFileSync(`${CACHE_DIR}snapshot.json`, JSON.stringify({ts: new Date(), orderDataList}, null, 2), function (err) {
        if (err) throw err;
    });
    
    return orderDataList.reverse();
}


// generateDataSnapshot();

module.exports = generateDataSnapshot