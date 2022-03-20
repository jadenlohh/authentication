const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const router = express.Router();
const client = new MongoClient(process.env.mongouri, { useNewUrlParser: true, useUnifiedTopology: true });
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());


router.get("/login", (req, res) => {
    res.render("login");
});


router.post("/login", (req, res) => {
    client.connect((err) => {
        const collection = client.db("passkeeper").collection("credentials");

        collection.findOne({ "email": req.body.email }, (err, account) => {
            if (account) {
                bcrypt.compare(req.body.password, account.password, (err, validPwd) => {
                    if (validPwd) {
                        var token = jwt.sign({ "email": req.body.email }, "secret", { expiresIn: "3d" });
    
                        res.cookie("token", token);
                        res.redirect("/dashboard");
                    } 
                    else {
                        res.render("login", { "error": 'InvalidCredentials', "email": req.body.email });
                    }
                });
            }
            else {
                res.render("login", { "error": 'InvalidCredentials', "email": req.body.email });
            }
        });
    });
});


router.get("/register", (req, res) => {
    res.render("registration");
});


router.post("/register", (req, res) => {
    client.connect((err) => {
        const collection = client.db("passkeeper").collection("credentials");
        var { firstName, lastName, email, password} = req.body;

        var account = collection.findOne({ "email": req.body.email });

        if (account) {
            res.render("registration", { "error": "AccountAlreadyExist", "firstName": firstName, "lastName": lastName, "email": email });
        }
        else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    var credentials = {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        password: hash,
                        twoFactorAuth: false,
                    };
    
                    collection.insertOne(credentials);
                });
            });

            res.cookie("token", jwt.sign({ "email": req.body.email }, "secret", { expiresIn: "3d" }));
            res.redirect("/dashboard");
        };
    });
});


module.exports = router;