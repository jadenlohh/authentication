const express = require('express')
const { MongoClient }  = require('mongodb')
const bcrypt = require('bcrypt')
const path = require('path')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const authentication = express.Router()
const client = new MongoClient(process.env.mongouri, { useNewUrlParser: true, useUnifiedTopology: true })
authentication.use(bodyParser.urlencoded({ extended: false }))
authentication.use(cookieParser())



authentication.get('/login', (req, res) => {
    res.render('login', { 'failedAuth': false })
})


authentication.post('/login', (req, res) => {
    client.connect(err => {
        const collection = client.db("passkeeper").collection("credentials")

        collection.findOne({'email': req.body.email}, (err, account) => {
            bcrypt.compare(req.body.password, account.password, (err, validPwd) => {
                if (validPwd) {
                    var token = jwt.sign({'email': req.body.email}, 'secret', {expiresIn: '3d'})
                    
                    res.cookie('token', token)
                    res.redirect('/dashboard')
                }
                else {
                    res.render('login', { 'failedAuth': true, 'email': req.body.email })
                }
            })
        })
    })
})


authentication.get('/register', (req, res) => {
    res.render('registration', { 'emailAlreadyExist': false })
})


authentication.post('/register', (req, res) => {
    client.connect(err => {
        var collection = client.db("passkeeper").collection("credentials")

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                var credentials = {
                    'firstName': req.body.firstName,
                    'lastName': req.body.lastName,
                    'email': req.body.email,
                    'password': hash,
                    'twoFactorAuth': false
                }
                collection.insertOne(credentials)
            })
        })

    //     var account = collection.findOne({'email': req.body.email})

    //     if (account) {
    //         res.render('registration', { 'emailAlreadyExist': true, 'firstName': req.body.firstName, 'lastName': req.body.lastName, 'email': req.body.email }) 
    //     }
        
    //     bcrypt.genSalt(10, (err, salt) => {
    //         bcrypt.hash(req.body.password, salt, (err, hash) => {
    //             var credentials = {
    //                 'firstName': req.body.firstName,
    //                 'lastName': req.body.lastName,
    //                 'email': req.body.email,
    //                 'password': hash,
    //                 'twoFactorAuth': false
    //             }
    //             collection.insertOne(credentials, () => { client.close() })
    //             res.redirect('/')

    //             var token = jwt.sign({'email': req.body.email}, 'secret', {expiresIn: '60'})
    //             document.cookie = 'token=' + token + ';'
    //             res.redirect('/dashboard')
    //         })
    //     })
    })
})

module.exports = authentication