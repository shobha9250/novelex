require('dotenv').config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//static files
router.use(express.static("public"));

//@type      GET
//@route     /api/auth/
//@desc      just for testing
//@access    PUBLIC

router.get("/", (req, res) => res.json({ test: "Auth is being tested" }));

//Import schema for Person to Register
const Person = require("../../models/Person");
const Profile = require("../../models/Profile");

//@type      POST
//@route     /api/auth/signup
//@desc      route for signing up of users
//@access    PUBLIC

router.post("/signup", (req, res) => {
  Person.findOne({ email: req.body.email })
    .then((person) => {
      if (person) {
        return res
          .status(400)
          .json({ emailerror: "Email is already registered!!" });
      } else {
        Person.findOne({ username: req.body.username }).then((person) => {
          if (person) {
            return res.status(400).json({ Invalid: "Username already exists" });
          } else {
            const newPerson = new Person({
              username: req.body.username,
              email: req.body.email,
              password: req.body.password,
            });
            const payload = {
              id: newPerson.id,
              username: newPerson.username,
              email: newPerson.email,
            };

            // encrypt password using bcrypt
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newPerson.password, salt, (err, hash) => {
                if (err) throw err;
                newPerson.password = hash;
                //saving data to database
                newPerson
                  .save()
                  .then()
                  .catch((err) => console.log(err));
              });
            });

            const newProfile = new Profile({
              user: newPerson.id,
              name: newPerson.username,
              username: newPerson.username,
            });
            newProfile
              .save()
              .then((profile) => {
                // passing json web token to url as queries ?calid is varaible that hold my json web token
                res.cookie('token', jwt.sign(payload,process.env.secret,{expiresIn: 3600}));
                res.redirect("/api/profile");
              })
              .catch((err) => console.log(err));
          }
        });
      }
    })
    .catch((err) => console.log(err));
});

//@type      GET
//@route     /api/auth/login
//@desc      route for login of users
//@access    PUBLIC

router.get("/login", (req, res) => {
  res.render("login");
});

//@type      POST
//@route     /api/auth/login
//@desc      route for login of users
//@access    PUBLIC

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  Person.findOne({ email })
    .then((person) => {
      if (!person) {
        return res.status(404).json({ emailerror: "User not found" });
      }
      bcrypt
        .compare(password, person.password)
        .then((isCorrect) => {
          if (isCorrect) {
            const payload = {
              id: person.id,
              username: person.username,
              email: person.email,
            };

            // passing json web token to url as queries ?calid is varaible that hold my json web token
            res.cookie('token', jwt.sign(payload,process.env.secret,{expiresIn: 3600}));
            res.redirect("/api/profile");
        
        } else {
            res.status(400).json({ passworderror: "password is not correct" });
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.get('/logout',(req,res) =>{
  res.clearCookie('token');
  res.redirect("/");
})

module.exports = router;