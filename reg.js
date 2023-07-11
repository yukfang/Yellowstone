{
    const raw = 're above 90%.<span style="color: #333333;">client has rejected/deprioritized: pixel and eapi recommendations were not adopted - still low pii signals, low de-duplication rate, missing parameters because of no interest.</span></p>'
    const reg = /(.*)(<\/span>)(.*)/
    
    
    const matches = raw.match(reg)
    console.log(matches)
    
    console.log(raw.replace(/<\/p>/, '').replace(/<\/span>/,'').replace(/(<span )(.*)(>)/m, ' '))
}


{
    const raw = '[Status Update]]123'
    const conclusion_reg   = /(.*)(\[Status Update\])(.*)/m
    const conclusion = raw.match(conclusion_reg)
    console.log(conclusion)
}



