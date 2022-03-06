const express = require('express')
const path = require('path')

const app = express()
app.use(express.static('public'))


app.use('/', require('./authentication'))


app.get('/', (req, res) => {
    res.redirect('/login')
})


app.listen(3000, () => {
    console.log('App listening on port 3000')
})