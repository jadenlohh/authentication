const express = require('express')
const path = require('path')
const { MongoClient }  = require('mongodb')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')


const app = express()
const client = new MongoClient(process.env.mongouri, { useNewUrlParser: true, useUnifiedTopology: true })
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use('/', require('./authentication'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())


app.get('/', (req, res) => {
    res.redirect('/login')
})


app.get('/dashboard', (req, res) => {
    try {
        if (!req.cookies.token) throw err

        jwt.verify(req.cookies.token, 'secret', (err, payload) => {
            client.connect(err => {
                const collection = client.db("passkeeper").collection("credentials")

                collection.findOne({'email': payload.email}, (err, account) => {
                    res.render('dashboard', { 'firstName': account.firstName, 'lastName': account.lastName, 'email': account.email })
                })
            })
        })
    }
    catch (err) {
        res.redirect('/login')
    }
})


app.listen(3000, () => {
    console.log('App listening on port 3000')
})