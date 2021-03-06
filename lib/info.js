const axios = require("axios")
const cheerio = require("cheerio")
const qs = require("qs")
const { sleep, removeNewlines } = require("./utils")

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


/**
 * @generator
 * @param {Array} comuniProvincia
 * @param {String} idProvincia
 * @param {String} idRegione
 * @yields {Promise} ComuneInfo
 */
const generateInfoForComuni = async function* (comuniProvincia, idProvincia, idRegione) {
    // console.log('generateInfoForComuni');

    for(let i=0; i < comuniProvincia.length; i++) {
        let comune = new Comune(comuniProvincia[i], idProvincia, idRegione)
        await sleep(100)    // rate-limit requests to findComuneInfo (in milliseconds)
        let info = findComuneInfo(comune)
        // console.log('YIELD INFO', info)
        yield info     // <---  *  here?
    }

    console.log('---------------------------------------')

    // const infos = Object.fromEntries(await Promise.all(
    //     comuniProvincia.map(idComune =>
    //         findComuneInfo(new Comune(idComune, idProvincia, idRegione))
    // )))
    // console.log('infos:', infos);
    // return infos
}


/**
 * Fetch the actual detail page and parse info for Comune
 * @typedef {[ Comune, InfoSet ]} ComuneInfo
 * @returns {ComuneInfo | null}
 * @param {Comune} comune
 */
const findComuneInfo = async comune => {
    const url = `http://italia.indettaglio.it/ita/email/email_out.html`
    console.log('Info for:', url, comune);
    const response = await axios.post(url, qs.stringify(comune))
        .catch(err => console.log('Impossibile collegarsi a ', url))
    if (response && response.data) {
        return [ comune, getInfoSetFrom(response.data) ]
    }
    return null
}
/**
 * @typedef {InfoChunk[]} InfoSet
 * @param {String} html     - Markup to parse
 * @returns {InfoSet}       - A set of chunks with info
 */
const getInfoSetFrom = html => {
    // parse HTTP-response content
    const $ = cheerio.load(html)
    const $infoColumns = $('.tb_resp table tr:not(.info) td')
    const infoLine = $infoColumns.toArray()
    // split in set of chunks (1 chunk = 1 table row)
    const infoSet = []
    const columnsPerRow = 4
    while (infoLine.length >= columnsPerRow) {
        /** @type {String[]} InfoChunk */
        let chunk = infoLine.splice(0, columnsPerRow)
        chunk = chunk.map(getNodeContent).map(removeNewlines)
        // console.log('chunk', chunk);
        infoSet.push(chunk)
    }
    return infoSet
}

const getNodeContent = node => {
    return (node.children ? getNodeContent(node.children[0])
        : node.data ? node.data
            : getNodeContent(node) || node.data
    )
}


const getEmailsFrom = async (htmlData, idComune) => {
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
    generateInfoForComuni,
    getEmailsFrom
}