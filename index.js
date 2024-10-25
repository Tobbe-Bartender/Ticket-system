const express = require("express");
const app = express();
const indexRoutes = require("./routes/indexroutes.js");
const { auth } = require('express-openid-connect');
const session = require('express-session');

const port = 1337;

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.set("view engine", "ejs");

app.use(session({
    secret: '89b8b28f7979be07f15f83a0592a6e27836998332e53c741916bedbd79e858aef663612f0ac043649b48fc85e5bcba962888e3579dbc2422abf4704e5a862e22',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: '',
    baseURL: 'http://localhost:1337',
    clientID: '',
    issuerBaseURL: ''
};
app.use(auth(config));

app.use(indexRoutes);

app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
});
