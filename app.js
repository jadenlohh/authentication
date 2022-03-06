const express = require('express')
const path = require('path')

const app = express()
app.use(express.static('public'))
app.set('view engine', 'ejs')


app.use('/', require('./authentication'))


app.get('/', (req, res) => {
    res.redirect('/login')
})


app.get('/dashboard', (req, res) => {
    res.send('dashboard')
})


app.listen(3000, () => {
    console.log('App listening on port 3000')
})