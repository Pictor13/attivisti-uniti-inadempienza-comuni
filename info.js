const axios = require("axios")
const cheerio = require("cheerio")
const qs = require("qs")
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

class Comune {
    constructor(idComune, idProvincia, idRegione) {
        this.id_comune = idComune
        this.id_provincia = idProvincia
        this.id_regione = idRegione
    }
}

// const findInfoFor = async (comuniProvincia, idProvincia, idRegione) => {
//     const comune = new Comune(idComune, idProvincia, idRegione)
//     return comuniProvincia.map(idComune => findComuneInfo(comune))
// }


const findInfoForComuni = async function *(comuniProvincia, idProvincia, idRegione) {
    console.log('findInfoForComuni');

    for(let i=0; i < comuniProvincia.length; i++) {
        let comune = new Comune(comuniProvincia[i], idProvincia, idRegione)
        console.log('findComuneInfo');
        const info = await findComuneInfo(comune)
        console.log('PAUSA', info);
        await sleep(1000)
        yield info
    }

    console.log('---------------------------------------')

    // const infos = Object.fromEntries(await Promise.all(
    //     comuniProvincia.map(idComune =>
    //         findComuneInfo(new Comune(idComune, idProvincia, idRegione))
    // )))
    // console.log('infos:', infos);
    // return infos
}


const findComuneInfo = async comune => {
    const url = `http://italia.indettaglio.it/ita/email/email_out.html`
    console.log('Info for:', url, comune);
    const options = {
        // headers: {
        //     // 'application/json' is the modern content-type for JSON, but some
        //     // older servers may use 'text/json'.
        //     // See: http://bit.ly/text-json
        //     'content-type': 'text/json'
        // }
    }
    const response = await axios.post(url, qs.stringify(comune), options)
        .catch(err => console.log('Impossibile collegarsi a ', url))
    if (response && response.data) {
        const infoChunks = getInfoChunksFrom(response.data)
        return [ comune, infoChunks ]
    } else {
        return null
    }
}
const getInfoChunksFrom = html => {
    console.log('getInfoChunksFrom');
    // parse HTTP-response content
    const $ = cheerio.load(html)

    // console.log(html);
    // return


    const $infoColumns = $('.tb_resp table tr:not(.info) td')
    console.log($infoColumns.length);
    const infoLine = $infoColumns.toArray()
    // split in chunks (1 chunk = 1 table row)
    const chunks = []
    const columnsPerRow = 4
    while (infoLine.length >= columnsPerRow) {
        let infoSet = infoLine.splice(0, columnsPerRow)
        infoSet = infoSet.map(
            column => column.data || column.children[0].data
        )
        console.log('infoset', infoSet);
        chunks.push(infoSet)
    }
    return chunks
}

const getNodeContent = node => {
    return (node.children ? getNodeContent(node.children)
        : node.data ? node.data
            : node
    )
}


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

module.exports = {
    findInfoForComuni,
    getEmailsFrom
}