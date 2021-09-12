function _uuid() {
    var d = Date.now()
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now() //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
}

const uid = _uuid()

$(() => {
    $("#uid").text(uid)

    $("#login").click(() => {
        window.location = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/login?uid=" + uid
    })
})