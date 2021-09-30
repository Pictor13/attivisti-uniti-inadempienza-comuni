
const removeNewlines = data =>
    typeof data == 'string' ? data.replace(/\n/g, '') : data

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
    removeNewlines,
    sleep
}