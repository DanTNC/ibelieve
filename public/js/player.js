var ibelieve_player

class IBelievePlayer {
    constructor(token) {
        this.initPlayer(token);
    }

    initPlayer(token) {
        this.token = token

        this.player = new Spotify.Player({
            name: 'Web Playback SDK Quick Start Player',
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
        $.ajax({
            url: 'https://api.spotify.com/v1/me/player',
            method: "PUT",
            data: JSON.stringify({
                "device_ids": [this.device_id]
            }),
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Content-Type": "application/json"
            },
            success: function(data) {
                console.log(data)
            },
            error: function(error) {
                console.error(error)
            }
        })
    }
}

window.onSpotifyWebPlaybackSDKReady = () => {
    $.get({
        url: '/token',
        success: function(token) {
            ibelieve_player = new IBelievePlayer(token)
        }
    })
}