$(() => {
    const uid = localStorage.getItem('uid')

    if (uid != null) {
        $("#uid").val(uid)
    }

    $("#login").click(() => {
        window.location = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/login?uid=" + $("#uid").val()
    })

    $("#signup").click(() => {
        window.location = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/signup"
    })
})