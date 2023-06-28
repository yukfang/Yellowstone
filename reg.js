const raw = 're above 90%.<span style="color: #333333;">client has rejected/deprioritized: pixel and eapi recommendations were not adopted - still low pii signals, low de-duplication rate, missing parameters because of no interest.</span></p>'

// const reg   = /(<span )(.*)(>)/m
const reg = /(.*)(<\/span>)(.*)/

// const conclusion_reg   = /(.*)(\[conclusion\])(.*)/m

const matches = raw.match(reg)
console.log(matches)

console.log(raw.replace(/<\/p>/, '').replace(/<\/span>/,'').replace(/(<span )(.*)(>)/m, ' '))