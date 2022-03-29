const express = require("express");
const { MongoClient }  = require("mongodb");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const client = new MongoClient(process.env.mongouri, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", require("./authentication"));
app.set("view engine", "ejs");
app.use(cookieParser());


app.get("/", (req, res) => {
    res.redirect("/login");
});


app.get("/dashboard", (req, res) => {
    try {
        if (!req.cookies.token) throw err;

        jwt.verify(req.cookies.token, "secret", (err, payload) => {
            client.connect(err => {
                const collection = client.db("authentication").collection("credentials");

                collection.findOne({"_id": payload.email}, (err, account) => {
                    res.render("dashboard", { "firstName": account.firstName, "lastName": account.lastName, "email": account._id });
                });
            });
        });
    }
    catch (err) {
        res.redirect("/login");
    }
});


app.post("/dashboard", (req, res) => {
    client.connect(err => {
        const collection = client.db("authentication").collection("credentials");
        var updateCredentials = { $set: {"firstName": req.body.firstName, "lastName": req.body.lastName} };

        jwt.verify(req.cookies.token, "secret", (err, payload) => {
            collection.updateOne({"_id": payload.email}, updateCredentials);

            collection.findOne({"_id": payload.email}, (err, result) => {
                res.render("dashboard", { "firstName": result.firstName, "lastName": result.lastName, "email": result._id, "updatedCredentials": true });
            });
        });
    });
});


app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});


app.listen(3000, () => {
    console.log("App listening on port 3000");
});