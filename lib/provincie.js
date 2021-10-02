const axios = require('axios');
const cheerio = require('cheerio');

/**
 * @param {String} idRegione
 * @typedef {[ String, String[] ]} ProvincieRegioni
 * @returns {ProvincieRegioni | null}
 */
const findProvinceFor = async idRegione => {
    const url = `http://italia.indettaglio.it/ita/email/selettore_email.html?id_regione=${idRegione}`
    const { data } = await axios.get(url)
        .catch(err => console.log('Impossibile collegarsi a ', url))
    if (data) {
        return [ idRegione, getIdProvinceFor(data) ]
    }
    console.error(`Can't fetch Provincie`)
    return null
}
const getIdProvinceFor = html => {
    const $ = cheerio.load(html)
    const $options = $('[name="id_provincia"] option')
    const idProvince = $options.toArray().map(option => $(option).val())
    return idProvince.filter(prov => prov && prov.length > 0)
}

const findProvince = async idRegioni =>
    Object.fromEntries(await Promise.all(
        idRegioni.map(id => findProvinceFor(id)
    )))


module.exports = {
    // findProvinceFor,
    // getIdProvinceFor,
    findProvince
}