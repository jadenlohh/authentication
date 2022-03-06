const express = require('express')
const { MongoClient }  = require('mongodb')
const bcrypt = require('bcrypt')
const path = require('path')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()

const app = express()
const client = new MongoClient(process.env.mongouri, { useNewUrlParser: true, useUnifiedTopology: true })
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))



app.get('/register', (req, res) => {
    res.sendFile(path.resolve(__dirname, './html/registration.html'))
})


app.post('/register', (req, res) => {
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


app.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, './html/login.html'))
})


app.post('/login', (req, res) => {
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


app.listen(3000, () => {
    console.log('App listening on port 3000')
})