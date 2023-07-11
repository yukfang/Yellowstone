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



