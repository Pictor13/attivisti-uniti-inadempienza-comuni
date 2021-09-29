const axios = require('axios');
const cheerio = require('cheerio');
const { findProvince } = require('./provincie.js')

const idRegioni = [ 13,17,18,15,08,06,12,07,03,11,14,01,16,20,19,09,04,10,02,05 ]

findProvince(idRegioni)
    .then(idProvince => {
        idProvince = idProvince.filter(province => province.length > 0).flat()
        console.log(idProvince)
        return idProvince
    })


return

// const attivistiUnitiList = function() {
//     return Array.from(document.querySelectorAll('.mce-item-table tr')).map(
//         tr => {
//             const row_columns = Array.from(tr.querySelectorAll('td'))
//             return {
//                 comune: row_columns[0].innerHTML,
//                 provincia: row_columns[1].innerHTML
//             }
//         }
//     )
// }

// let idComune = new Integer(`${idProvincia}000`)

// idComune++
// let inDettaglioUrl = `http://italia.indettaglio.it/ita/email/selettore_email.html?id_provincia=${idProvincia}&id_comune=${idComune}`
// const res = await fetch(inDettaglioUrl).catch(console.error(`Impossibile contattare l'URL: ${inDettaglioUrl}`))
// if (res && res.body) {

// }


// province.forEach(
//     provincia => findComuni(provincia)
// )


const getEmailsFrom = async (htmlData, idComune) => {
    console.log('parse', idComune)
    // parse HTTP-response content
    const $ = cheerio.load(htmlData)
    const $infoColumns = $('.tb_resp table tr:not(.info) td')
    const infoLine = $infoColumns.toArray().map(
        column => {
            const child = column.children.pop()
            return child.children
                ? child.children.pop().data
                : child.data
        }
    )
    // split in chunks (1 chunk = 1 table row)
    const chunks = []
    const columnsPerRow = 4
    while (infoLine.length >= columnsPerRow) {
        chunks.push(infoLine.splice(0, columnsPerRow))
    }
    return chunks
}

const generateIds = async () => {
    const infos = []
    for (let idProvincia = 8; idProvincia < 1000; idProvincia++) {
        for (let idComune = 2; idComune < 1000; idComune++) {
            let threeDigitsProvincia = `000${idProvincia}`.slice(-3)
            let sixDigitsComune =  threeDigitsProvincia + `000${idComune}`.slice(-3)
            // let inDettaglioUrl = `http://italia.indettaglio.it/ita/email/selettore_email.html?id_provincia=${threeDigitsProvincia}&id_comune=${sixDigitsComune}`
            let inDettaglioUrl = `http://italia.indettaglio.it/ita/email/email_out.html`
            let requestData = {
                id_provincia: threeDigitsProvincia,
                id_comune: sixDigitsComune
            }

            // try to see if there's a matching Comune
            console.info(`Fetch from: ${inDettaglioUrl}`, requestData)
            const { data: htmlResponse } = await axios.post(inDettaglioUrl, requestData)
                .catch(err => console.error(`Impossibile contattare l'URL`, err))

            if (htmlResponse) {
                let emails = await getEmailsFrom(htmlResponse)
                // build info object to return
                const info = {
                    id_comune: idComune,
                    info: emails
                }
                return info
                console.debug(info)
                // add info to array of infos
                infos.push(info)
            } else {
                console.warn('HTML response is empty')
            }
        }
    }
    console.log(infos)
    // return infos
}

console.log(generateIds())