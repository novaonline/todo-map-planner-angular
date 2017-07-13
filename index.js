const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 3000
var bodyParser = require('body-parser')
var methodOverride = require('method-override')

app.use(express.static(path.join(__dirname, 'client/dist')))

app.get('*', function (req, res) {
  res.sendFile('index.html')
})

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(methodOverride())
app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

app.listen(PORT, function () {
  console.log(`app listening on port ${PORT}!`)
})

function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}
function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}
function errorHandler (err, req, res, next) {
  res.status(500)
  res.render('error', { error: err })
}
