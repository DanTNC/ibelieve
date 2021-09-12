$(() => {
    localStorage.setItem("NT", "TAYEN")

    $("#login").click(() => {
        window.location = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/login"
    })
})