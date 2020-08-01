//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const helmet = require('helmet')
const flash=require("connect-flash");



const app = express();
app.use(helmet())
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: false
}));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


app.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    // failureFlash : { type: 'error', message: 'Invalid username or password.' }
    failureFlash : true
  }),
  function (req, res) {
    console.log("test")
    res.redirect('/');
  });

app.get("/", function (req, res) {
  console.log(req.user)
  res.render("home", {user: req.user, error : req.flash('error')});
});

app.get("/login", function (req, res) {
  // res.render("login");
  // console.log(req.flash('error'))
  res.render('login', {user: req.user, error : req.flash('error')})
});

app.get("/register", function (req, res) {
  // console.log(req.flash('error'))
  res.render("register",{error: req.flash('error')});
});

app.post("/register", function (req, res) {
  console.log(req.body.username, req.body.password)
  User.register(new User({
    username: req.body.username}),
    req.body.password, function (err, user) {
    if (err) {
      console.log("there was an error")
      console.log(err);
      // res.render('register', {error : err})
      req.flash('error', err.message)
      res.redirect('/register')
    } else {
      console.log("register successful")
      passport.authenticate("local")(req, res, function(){
        res.redirect('/')
      })
    }
  });
});





app.listen(3000, function () {
  console.log("Server started on port 3000.");
});