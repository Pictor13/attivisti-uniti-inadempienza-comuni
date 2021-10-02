const axios = require('axios');
const cheerio = require('cheerio');
const { findComuniRegione, findComuniEntriesFor } = require('./comuni.js');
// const { findProvince } = require('./provincieRegione.js')
const { idRegioni } = require('./database.js');
const { generateInfoForComuni, getEmailsFrom } = require('./info.js');

// findProvince(idRegioni)
//     .then(idProvince => {
//         console.log(idProvince)
//         return idProvince
//     })

idRegioni.map(idRegione => {
    findComuniRegione(idRegione).then(async comuniByProvincia => {
        let infoComuni = []
        if (comuniByProvincia) {
            comuniByProvincia = comuniByProvincia.filter(comuni => comuni.length > 0)

            for (let i=0; i < comuniByProvincia.length; i++) {
                console.log('Go through comuniByProvincia');
                let [idProvincia, idComuni] = comuniByProvincia[i]

                // let infoComuniGenerator = generateInfoForComuni(idComuni, idProvincia, idRegione)
                // console.log('VALUE:', infoComuniGenerator.next().value);
                // for (let info = infoComuniGenerator.next().value; info <= idComuni.length; info = infoComuniGenerator.next(info).value) {
                for await (let info of generateInfoForComuni(idComuni, idProvincia, idRegione)) {
                    // console.dir(info, {depth:null})
                    console.log('------')
                    infoComuni.push(info)
                }
            }
            // infoComuni = comuniByProvincia.map(([idProvincia, idComuni]) =>
            //     await generateInfoForComuni(idComuni, idProvincia, idRegione)
            // )
        }
        console.log(`EMAILS PER COMUNI IN REGIONE: ${idRegione}`)
        console.dir(infoComuni, {depth:null})
        return [idRegione, infoComuni]
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