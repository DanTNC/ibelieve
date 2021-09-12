$(() => {
    const uid = localStorage.getItem('uid')

    if (uid != null) {
        $("#uid").val(uid)
    }

    $("#signup").click(() => {
        window.location = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/signup"
    })
})