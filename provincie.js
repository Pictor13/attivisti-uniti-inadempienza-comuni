const axios = require('axios');
const cheerio = require('cheerio');

const findProvinciaFor = async idRegione => {
    const url = `http://italia.indettaglio.it/ita/email/selettore_email.html?id_regione=${idRegione}`
    const { data } = await axios.get(url)
        .catch(err => console.log('Impossibile collegarsi a ', url))
    if (data) {
        return getIdProvinceFor(data)
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
    Promise.all(idRegioni.map(id => findProvinciaFor(id)))

module.exports = {
    findProvinciaFor,
    getIdProvinceFor,
    findProvince
}