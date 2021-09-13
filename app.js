const express = require('express')
const axios = require('axios')
const qs = require('qs')
const app = express()
const path = require('path')

const mongoose = require('./db/dbconnect')()
const mappingModel = require('./db/mapping')(mongoose)
const saveMapping = require('./db/save')
const loadMapping = require('./db/load')

const port = process.env.PORT || 3000
const dev = (process.env.ibelieve_dev || "false") === "true"
const redirect_uri = dev? 'http://localhost:3000/callback': 'https://ibelieve.herokuapp.com/callback'

const get_token = (code, uid, callback) => {
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
    saveMapping(mappingModel, {
      uid: uid,
      access: response.data.access_token,
      refresh: response.data.refresh_token
    }, callback)
  }).catch((error) => {
    console.log(error)
  })
}

const refresh = (uid, refresh_token, callback) => {
  axios.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify({
      refresh_token: refresh_token,
      grant_type: 'refresh_token',
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
    saveMapping(mappingModel, {
      uid: uid,
      access: response.data.access_token,
      refresh: response.data.refresh_token ?? refresh_token
    }, callback)
  }).catch((error) => {
    console.log(error)
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

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'view/signup.html'))
})

app.get('/login', function(req, res) {
  var scopes = 'playlist-read-private \
                streaming \
                user-read-email \
                user-read-private \
                user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + process.env.ibelieve_client_id +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(redirect_uri) + 
      '&state=' + req.query.uid)
});

app.get('/callback', (req, res) => {
  get_token(req.query.code, req.query.state, (dbres)=>{
    console.log(`${req.query.code}:${req.query.state}`)
    if (dbres[0]) {
      res.redirect(`/player?uid=${req.query.state}`)
    } else {
      res.status(400).json({message: dbres[1]})
    }
  })
})

app.get('/token', (req, res) => {
  if (req.query.action == "refresh") {
    loadMapping(mappingModel, req.query.uid, (dbres) => {
      if (dbres[0]) {
        refresh(req.query.uid, dbres[1].refresh, (dbres) => {
          if (dbres[0]) {
            res.send(dbres[1])
          } else {
            res.status(400).json({message: dbres[1]})
          }
        })
      } else {
        res.status(400).json({message: dbres[1]})
      }
    })
  } else {
    loadMapping(mappingModel, req.query.uid, (dbres) => {
      if (dbres[0]) {
        res.send(dbres[1].access)
      } else {
        res.status(400).json({message: dbres[1]})
      }
    })
  }
})

app.get('/player', (req, res) => {
  res.sendFile(path.resolve(__dirname, "view/player.html"))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})