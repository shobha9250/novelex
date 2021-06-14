const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../setup/myurl");

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

            // encrypt password using bcrypt
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newPerson.password, salt, (err, hash) => {
                if (err) throw err;
                newPerson.password = hash;
                //saving data to database
                newPerson
                  .save()
                  .then((person) => res.json(person))
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
              .then((profile) => res.json(profile))
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

            // passing json web token to url as queryies
            res.redirect("/api/profile/?valid=" +   jsonwt.sign(payload, key.secret, { expiresIn: 3600 }));
          
        
        } else {
            res.status(400).json({ passworderror: "password is not correct" });
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

module.exports = router;
