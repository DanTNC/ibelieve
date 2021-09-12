var ibelieve_player

const urlSearchParams = new URLSearchParams(window.location.search);
const uidFromQuery = urlSearchParams.get('uid');
console.log(uidFromQuery);
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
            volume: 0.5
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
}

window.onSpotifyWebPlaybackSDKReady = () => {
    getTokenThen((token) => {
        ibelieve_player = new IBelievePlayer(token)
    })
}