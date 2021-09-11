const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send(req.query.token)
})

app.get('/callback', (req, res) => {
    res.send(`${req.query.code}:${req.query.state}`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})