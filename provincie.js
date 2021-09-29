const axios = require('axios');
const cheerio = require('cheerio');

/**
 * @typedef {Object} ProvincieRegioni
 *
 * @param {String} idRegione
 * @returns {Object} ProvincieRegioni
 */
const findProvinciaFor = async idRegione => {
    const url = `http://italia.indettaglio.it/ita/email/selettore_email.html?id_regione=${idRegione}`
    const { data } = await axios.get(url)
        .catch(err => console.log('Impossibile collegarsi a ', url))
    if (data) {
        return [ idRegione, getIdProvinceFor(data) ]
    } else {
        console.error('nada')
    }
}
const getIdProvinceFor = html => {
    const $ = cheerio.load(html)
    const $options = $('[name="id_provincia"] option')
    const idProvince = $options.toArray().map(option => $(option).val())
    return idProvince.filter(prov => prov && prov.length > 0)
}

const findProvince = async idRegioni =>
    Object.fromEntries(await Promise.all(
        idRegioni.map(id => findProvinciaFor(id)
    )))


module.exports = {
    // findProvinciaFor,
    // getIdProvinceFor,
    findProvince
}