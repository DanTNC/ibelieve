const express = require('express')
const axios = require('axios')
const qs = require('qs')
const app = express()
const path = require('path')
const port = process.env.PORT || 3000
const dev = (process.env.ibelieve_dev || "false") === "true"
const redirect_uri = dev? 'http://localhost:3000/callback': 'https://ibelieve.herokuapp.com/callback'

var mapping = {}

const get_token = (code, callback) => {
  axios.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify({
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri,
      client_id: process.env.ibelieve_client_id,
      client_secret: process.env.ibelieve_client_secret,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    } 
  ).then((response) => {
    console.log(response)
    mapping["TAYEN"] = {
      access: response.data.access_token,
      refresh: response.data.refresh_token
    }
    callback()
  }).catch((error) => {
    console.log(error)
  })
}

const refresh = (callback) => {
  get_token(mapping["TAYEN"]["refresh_token"], ()=>{
    console.log("refresh done")
    callback()
  })
}

app.use(express.static(path.resolve(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'view/home.html'))
})

app.get('/login', function(req, res) {
  var scopes = 'playlist-read-private \
                streaming \
                user-read-email \
                user-read-private';
  res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + process.env.ibelieve_client_id +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(redirect_uri) + 
      '&state=TAYEN')
});

app.get('/callback', (req, res) => {
  get_token(req.query.code, ()=>{
    console.log(`${req.query.code}:${req.query.state}`)
    res.redirect('/player')
  })
})

app.get('/token', (req, res) => {
  if (req.query.action == "refresh") {
    refresh(() => {res.send(mapping["TAYEN"]["access"])})
  } else {
    res.send(mapping["TAYEN"]["access"])
  }
})

app.get('/player', (req, res) => {
  res.sendFile(path.resolve(__dirname, "view/player.html"))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})