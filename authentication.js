const express = require('express')
const { MongoClient }  = require('mongodb')
const bcrypt = require('bcrypt')
const path = require('path')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()

const authentication = express.Router()
const client = new MongoClient(process.env.mongouri, { useNewUrlParser: true, useUnifiedTopology: true })
authentication.use(bodyParser.urlencoded({ extended: false }))



authentication.get('/login', (req, res) => {
    res.render('login', { 'failedAuth': false })
})


authentication.post('/login', (req, res) => {
    client.connect(err => {
        const collection = client.db("passkeeper").collection("credentials")

        var account = collection.findOne({'email': req.body.email})
            
        bcrypt.compare(req.body.password, account.password, (err, validPwd) => {
            if (validPwd) {
                res.redirect('/dashboard')
            }
            else {
                res.render('login', { 'failedAuth': true, 'email': req.body.email })
            }
        })
    })
})


authentication.get('/register', (req, res) => {
    res.render('registration', { 'emailAlreadyExist': false })
})


authentication.post('/register', (req, res) => {
    client.connect(err => {
        var collection = client.db("passkeeper").collection("credentials")
        
        var account = collection.findOne({'email': req.body.email})

        if (!account) {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    var credentials = {
                        'firstName': req.body.firstName,
                        'lastName': req.body.lastName,
                        'email': req.body.email,
                        'password': hash,
                        'twoFactorAuth': false
                    }
                    collection.insertOne(credentials, () => { client.close() })
                    res.redirect('/dashboard')
                })
            })
        }
        else {
            res.render('registration', { 'emailAlreadyExist': true, 'firstName': req.body.firstName, 'lastName': req.body.lastName, 'email': req.body.email }) 
        }
    })
})

module.exports = authentication