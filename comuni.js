const axios = require('axios');
const cheerio = require('cheerio');

const findComuneFor = async idRegione => {
    const url = `http://italia.indettaglio.it/ita/email/selettore_email.html?id_regione=${idRegione}`
    const { data } = await axios.get(url)
        .catch(err => console.log('Impossibile collegarsi a ', url))
    if (data) {
        return getIdComuniFor(data)
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

const findComuni = async idRegioni =>
    Promise.all(idRegioni.map(id => findComuneFor(id)))

module.exports = {
    findComuneFor,
    getIdComuniFor,
    findComuni
}