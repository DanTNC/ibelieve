var ibelieve_player
var app
var volume_width = 0
var volume_controller_x = 0
var position_width = 0
var position_controller_x = 0
var timer
var sync_counter = 0
var debug = false

const urlSearchParams = new URLSearchParams(window.location.search);
const uidFromQuery = urlSearchParams.get('uid');
if (uidFromQuery) {
    localStorage.setItem("uid", uidFromQuery)
}
const uid = localStorage.getItem("uid")

const checkIfExpired = (token, callback) => {
    $.get({
        url: 'https://api.spotify.com/v1/me',
        data: {
            access_token: token
        },
        cache: false,
        success: function(info) {// not expired
            app.name = info.display_name
            app.email = info.email
            app.image = info.images[0].url
            callback(token)
        },
        error: function(message) {
            message = message.responseJSON
            if (message?.error?.status == 401 && message?.error?.message == "The access token expired") {//expired
                console.log("refresh token because it expired")
                $.get({
                    url: '/token',
                    data: {
                        "uid": uid,
                        "action": "refresh"
                    },
                    cache: false,
                    success: function(token) {
                        callback(token)
                    },
                    error: function(message) {
                        console.error(message)
                    }
                })
            } else {
                console.error(message)
            }
        }
    })
}

const getTokenThen = (callback) => {
    $.get({
        url: '/token',
        data: {
            "uid": uid,
        },
        cache: false,
        success: function(token) {
            checkIfExpired(token, callback)
        },
        error: function(message) {
            console.log(message)
        }
    })
}

const updatePosition = () => {
    ibelieve_player.player.getCurrentState().then((state) => {
        app.position = state.position
    })
}

const clearTimer = () => {
    if (timer) clearInterval(timer)
}

const resetTrackTimer = () => {
    clearTimer()
    sync_counter = 0
    timer = setInterval(() => {
        sync_counter += 1
        if (sync_counter >= 20) {
            updatePosition()
            sync_counter = 0
        } else {
            app.position += 500
        }
    }, 500)
}

const volumeDragging = (e) => {
    e = e || window.event
    e.preventDefault()
    const new_width = volume_width + (e.clientX - volume_controller_x)
    ibelieve_player.setVolume(new_width / $("#volume-box .progress").width())
}

const positionDragging = (e) => {
    e = e || window.event
    e.preventDefault()
    const new_width = position_width + (e.clientX - position_controller_x)
    app.position = Math.round(new_width / $("#track-position .progress").width() * app.duration)
}

const seekPosition = () => {
    clearTimer()
    ibelieve_player.player.seek(app.position).then(updatePosition)
    clearEvents()
}

const clearEvents = () => {
    document.onmousemove = null
    document.onmouseup = null
}

const registerPlayerUIListeners = (player) => {
    $("#togglePlay").click(() => {
        player.togglePlay()
    })

    $("#prevTrack").click(() => {
        player.previousTrack()
    })

    $("#nextTrack").click(() => {
        player.nextTrack()
    })

    $("#volume-controller").on('mousedown', (e) => {
        e = e || window.event
        e.preventDefault()
        volume_width = $("#volume-box .progress-bar").width()
        volume_controller_x = e.clientX
        document.onmousemove = volumeDragging
        document.onmouseup = clearEvents
    })

    $("#position-controller").on('mousedown', (e) => {
        e = e || window.event
        e.preventDefault()
        position_width = $("#track-position .progress-bar").width()
        position_controller_x = e.clientX
        document.onmousemove = positionDragging
        document.onmouseup = seekPosition
    })
}

class IBelievePlayer {
    constructor(token) {
        this.initPlayer(token);
    }

    initPlayer(token) {
        this.player = new Spotify.Player({
            name: 'I Believe Spotify',
            getOAuthToken: cb => { cb(token) },
            volume: 0.1
        })
    
        // Ready
        this.player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id)
            this.device_id = device_id
            this.connectThis()
        })
    
        // Not Ready
        this.player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id)
        })
    
        this.player.addListener('initialization_error', ({ message }) => {
            console.error(message)
        })
    
        this.player.addListener('authentication_error', ({ message }) => {
            console.error(message)
        })
    
        this.player.addListener('account_error', ({ message }) => {
            console.error(message)
        })

        this.player.addListener('player_state_changed', (state) => {
            this.player.getCurrentState().then((state) => {
                if (debug) console.log(state)
                app.track_name = state.track_window.current_track.name
                app.album_image = state.track_window.current_track.album.images.at(-1).url
                app.album_name = state.track_window.current_track.album.name
                app.paused = state.paused
                app.position = state.position
                app.duration = state.duration
                if (state.paused) {
                    clearTimer()
                } else {
                    resetTrackTimer()
                }
            })
            this.player.getVolume().then((volume) => {
                app.volume = Math.round(volume * 100)
            })
        })

        registerPlayerUIListeners(this.player)
    
        this.player.connect()
    }

    connectThis() {
        getTokenThen((token) => {
            $.ajax({
                url: 'https://api.spotify.com/v1/me/player',
                method: "PUT",
                data: JSON.stringify({
                    "device_ids": [this.device_id]
                }),
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                success: function(data) {
                    console.log(data)
                },
                error: function(error) {
                    console.error(error)
                }
            })
        })
    }

    setVolume(volume) {
        this.player.setVolume(volume).then(() => {
            app.volume = Math.round(volume * 100)
        })
    }
}

window.onSpotifyWebPlaybackSDKReady = () => {
    getTokenThen((token) => {
        ibelieve_player = new IBelievePlayer(token)
    })
}

$(()=>{
    app = new Vue({
        el: '#app',
        data: {
            volume: 0,
            paused: true,
            name: '',
            email: '',
            image: '',
            album_name: '<專輯>',
            album_image: "/image/placeholder.jpg",
            track_name: '<歌名>',
            artists: [],
            position: 0,
            duration: 1
        },
        computed: {
            position_percentage() {
                return String(Math.round(this.position / this.duration * 100)) + '%'
            }
        }
    })
})