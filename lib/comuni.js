const axios = require('axios');
const cheerio = require('cheerio');
const { provinceByRegione } = require('./database.js')


const findComuniEntriesFor = async (idRegione, idProvincia) => {
    const url = `http://italia.indettaglio.it/ita/email/selettore_email.html?id_regione=${idRegione}&id_provincia=${idProvincia}`
    const { data } = await axios.get(url)
        .catch(err => console.log('Impossibile collegarsi a ', url))
    if (data) {
        return [ idProvincia, getIdComuniFor(data) ]
    } else {
        console.error('nada')
    }
}
const getIdComuniFor = html => {
    const $ = cheerio.load(html)
    const $options = $('[name="id_comune"] option')
    const idComuni = $options.toArray().map(option => $(option).val())
    return idComuni.filter(prov => prov && prov.length > 0)
}

const findComuniRegione = async (idRegione) => {
    if (!provinceByRegione[idRegione])
        return []

    return await Promise.all(
        provinceByRegione[idRegione].map(
            idProvincia =>
                findComuniEntriesFor(idRegione, idProvincia)
    ))
}


module.exports = {
    findComuniEntriesFor,
    // getIdComuniFor,
    findComuniRegione
}