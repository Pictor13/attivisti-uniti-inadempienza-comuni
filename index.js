const axios = require('axios');
const cheerio = require('cheerio');
const { findComuniRegione, findComuniEntriesFor } = require('./comuni.js');
// const { findProvince } = require('./provincieRegione.js')
const { idRegioni } = require('./database.js');
const { findInfoForComuni, getEmailsFrom } = require('./info.js');

// findProvince(idRegioni)
//     .then(idProvince => {
//         console.log(idProvince)
//         return idProvince
//     })

idRegioni.forEach(idRegione => {
    findComuniRegione(idRegione).then(comuniByProvincia => {
        let infoComuni = []
        if (comuniByProvincia) {
            comuniByProvincia = comuniByProvincia.filter(comuni => comuni.length > 0)

            for (let i=0; i < comuniByProvincia.length; i++) {
                console.log('Go through comuniByProvincia');
                let [idProvincia, idComuni] = comuniByProvincia[i]
                
                let infoComuniGenerator = findInfoForComuni(idComuni, idProvincia, idRegione)
                for (let info = infoComuniGenerator.next().value; info <= 5; i = infoComuniGenerator.next(info).value) {
                    console.log('Got info', info)
                    infoComuni.push(info)
                }
            }
            // infoComuni = comuniByProvincia.map(([idProvincia, idComuni]) =>
            //     await findInfoForComuni(idComuni, idProvincia, idRegione)
            // )
        }
        console.log('TROVATI:', infoComuni)
        return infoComuni
    })

    // const comuniPerProvincia = provincieRegione.map(idProvincia =>
    //     findComuniEntriesFor(idRegione, idProvincia)
    //         .then(idComuni => {
    //             idComuni = idComuni.filter(comuni => comuni.length > 0).flat()
    //             console.log(idComuni)
    //             return idComuni
    //         })
    // )
})


const getEmailFor = async comune => {
    const {idComune, idProvincia, idRegione} = comune
    const threeDigitsProvincia = `000${idProvincia}`.slice(-3)
    const sixDigitsComune =  threeDigitsProvincia + `000${idComune}`.slice(-3)
    const inDettaglioUrl = `http://italia.indettaglio.it/ita/email/email_out.html`
    const requestData = {
        id_regione: idRegione,
        id_provincia: threeDigitsProvincia,
        id_comune: sixDigitsComune
    }

    // try to see if there's a matching Comune
    console.info(`Fetch from: ${inDettaglioUrl}`, requestData)
    const { data } = await axios.post(inDettaglioUrl, requestData)
        .catch(err => console.error(`Impossibile contattare l'URL`, err))

    if (data) {
        let emails = await getEmailsFrom(data)
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


// const generateIds = async () => {
//     const infos = []
//     for (let idProvincia = 8; idProvincia < 1000; idProvincia++) {
//         for (let idComune = 2; idComune < 1000; idComune++) {
//             let threeDigitsProvincia = `000${idProvincia}`.slice(-3)
//             let sixDigitsComune =  threeDigitsProvincia + `000${idComune}`.slice(-3)
//             // let inDettaglioUrl = `http://italia.indettaglio.it/ita/email/selettore_email.html?id_provincia=${threeDigitsProvincia}&id_comune=${sixDigitsComune}`
//             let inDettaglioUrl = `http://italia.indettaglio.it/ita/email/email_out.html`
//             let requestData = {
//                 id_provincia: threeDigitsProvincia,
//                 id_comune: sixDigitsComune
//             }

//             // try to see if there's a matching Comune
//             console.info(`Fetch from: ${inDettaglioUrl}`, requestData)
//             const { data: data } = await axios.post(inDettaglioUrl, requestData)
//                 .catch(err => console.error(`Impossibile contattare l'URL`, err))

//             if (data) {
//                 let emails = await getEmailsFrom(data)
//                 // build info object to return
//                 const info = {
//                     id_comune: idComune,
//                     info: emails
//                 }
//                 return info
//                 console.debug(info)
//                 // add info to array of infos
//                 infos.push(info)
//             } else {
//                 console.warn('HTML response is empty')
//             }
//         }
//     }
//     console.log(infos)
//     // return infos
// }

// console.log(generateIds())