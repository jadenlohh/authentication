const express = require('express')
const { MongoClient }  = require('mongodb')
const bcrypt = require('bcrypt')
const path = require('path')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()

const authentication = express.Router()
const client = new MongoClient(process.env.mongouri, { useNewUrlParser: true, useUnifiedTopology: true })
authentication.use(bodyParser.urlencoded({ extended: false }))



authentication.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, './views/login.html'))
})


authentication.post('/login', (req, res) => {
    client.connect(err => {
        const collection = client.db("passkeeper").collection("credentials")
        
        collection.findOne({'email': 'jadenloh24@gmail.com'}, (err, account) => {
            var validPwd = bcrypt.compareSync('emaheqceags123', account.password)
            
            if (!validPwd) {
                res.redirect('/login')
            }
            else if (account.twoFactorAuth) {
                res.redirect('/2FA')
            }
            else {
                res.redirect('/dashboard')
            }
        })
    })
})


authentication.get('/register', (req, res) => {
    res.sendFile(path.resolve(__dirname, './views/registration.html'))
})


authentication.post('/register', (req, res) => {
    client.connect(err => {
        var collection = client.db("passkeeper").collection("credentials")
        var hashedPwd = bcrypt.hashSync('emahqceags123', 10)
        var credentials = {
            'firstName': req.body.firstName,
            'lastName': req.body.lastName,
            'email': req.body.email,
            'password': hashedPwd,
            'twoFactorAuth': false
        }
        
        collection.insertOne(credentials, () => { client.close() })
    })

    res.redirect('/register')
})

module.exports = authentication