{
    const raw = 're above 90%.<span style="color: #333333;">client has rejected/deprioritized: pixel and eapi recommendations were not adopted - still low pii signals, low de-duplication rate, missing parameters because of no interest.</span></p>'
    const reg = /(.*)(<\/span>)(.*)/
    
    
    const matches = raw.match(reg)
    // console.log(matches)
    
    // console.log(raw.replace(/<\/p>/, '').replace(/<\/span>/,'').replace(/(<span )(.*)(>)/m, ' '))
}


{
    const raw = "&nbsp;Synced up with AirAsia to explain benefits of MAM and AAM. Also sent across audit doc + GTM S2S template for clients to implement EAPI and improve their funnel events.&nbsp;https://bytedance.sg.feishu.cn/docx/Gy9tdLZYBoXf9PxspNdltFQNgFR&nbsp;"
    status_notes = raw.replaceAll("&nbsp;", '')
                                .replace(/(<span )(.*)(>)/m, ' ').replace(/<\/span>/,'')
                                .replace(/<ul>/, '').replace(/<\/ul>/, '')
                                .replace(/<li>/, '').replace(/<\/li>/, '')
                                .replace(/<p>/, '').replace(/<\/p>/, '')
                                .replace(/<strong>/, '').replace(/<\/strong>/, '')
    console.log(status_notes)
}



{
    async function sha256(text) {
        // Convert the message string into an array of bytes.
        const msgUint8 = new TextEncoder().encode(text);
        
        // Generate the hash.
        const hashBuffer = await self.crypto.subtle.digest('SHA-256', msgUint8);
        
        // Convert the hash into a hexadecimal string.
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }
    
    // Example usage:
    (async () => {
        const hash = await sha256('abc@xyz.com');
        console.log(hash);
    })();
    
}
