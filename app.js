const express = require('express')
const axios = require('axios')
const app = express()
const port = process.env.PORT || 3000

redirect_uri = 'https://ibelieve.herokuapp.com/callback'

app.get('/', (req, res) => {
  res.send("Home")
})

app.get('/login', function(req, res) {
  var scopes = 'playlist-read-private';
  res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + process.env.ibelieve_client_id +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(redirect_uri)) + 
      '&state=TAYEN';
});

app.get('/callback', (req, res) => {
  axios.post(
    'https://accounts.spotify.com/api/token',
    {
      code: req.query.code,
      grant_type: 'authorization_code',
      redirect_uri: encodeURIComponent(redirect_uri)
    },
    {
      headers: {
        'Authorization': 'Authorization: Basic ' + process.env.ibelieve_auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    } 
  ).then((response) => {
    console.log(response)
  }).catch((error) => {
    console.log(error)
  })
  res.send(`${req.query.code}:${req.query.state}`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})