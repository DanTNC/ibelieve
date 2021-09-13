var ibelieve_player
var app

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
        success: function(data) {// not expired
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
            this.connectThis();
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
                console.log(state)
                app.track_name = state.track_window.current_track.name
                app.paused = state.paused
            })
            this.player.getVolume().then((volume) => {
                app.volume = Math.round(volume * 100)
            })
        })
    
        $("#togglePlay").click(() => {
            this.player.togglePlay()
        })
    
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
        el: '#player',
        data: {
            track_name: '',
            volume: 0,
            paused: true
        }
    })
})