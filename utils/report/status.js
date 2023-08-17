function extract(tags){
    let main_status = 'Open Status'
    let sub_status  = 'MPO Scoping Phase'
    try{
        if(tags && tags.length > 0) {
            // console.log(tags)
            main_status   = tags[0]?.name || main_status
            sub_status    = tags[0].sub_tags[0]?.name || main_status
            if(sub_status.includes("Pending with GBS")) {
                sub_status = "Pending GBS Comms"
            } else if(sub_status.includes("Pending with Client")) {
                sub_status = "Pending Client Assessment"
            }
            console.log(`${main_status} ${sub_status}`)
        }
    } catch(err) {
        throw err
    }

    return {main_status, sub_status};
}

module.exports = extract
