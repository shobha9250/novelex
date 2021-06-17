require("dotenv").config();
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");

//load person model
const Person = require("../../models/Person");

//load profile model
const Profile = require("../../models/Profile");
const { route } = require("./auth");
const { JsonWebTokenError } = require("jsonwebtoken");

//static files
router.use(express.static("public"));




//multer setting
var storage =multer.diskStorage({
    destination: function (req,file, cb){
        cb(null, './public/myupload')
    },
    filename: function(req,file,cb){
        cb(null,file.fieldname+'-' + Date.now()+ path.extname(file.originalname))      
       }
})

var upload = multer(
    {storage: storage
    }).single('profileimage')


//@type      GET
//@route     /api/profile/
//@desc      route for personal user profile
//@access    PRIVATE

let token;
router.get("/", (req, res) => {
  //getting token from query
  token = req.query.valid;

  //using verify to check my token
  jwt.verify(token, process.env.secret, (err, user) => {
    if (!err) {
      Profile.findOne({ user: user.id })
        .then((profile) => {
          if (!profile) {
            return res
              .status(404)
              .json({ profilenotfound: "no profile found" });
          }
          console.log(profile);
          res.render("profile", profile);
        })
        .catch((err) => console.log("Got some error in profile " + err));
    } else {
      return res.status(403).json({ message: "User not authorised" });
    }
  });
});

//@type      POST
//@route     /api/profile/edit/
//@desc      route for updating/saving user profile
//@access    PRIVATE

router.post("/edit/", (req, res) => {
  //using verify to check my token
  jwt.verify(token, process.env.secret, (err, user) => {
    if (!err) {
      console.log("got verified");
      const profileValues = {};
      if (req.body.name) profileValues.name = req.body.name;
      if (req.body.address) profileValues.address = req.body.address;
      if (req.body.contact) profileValues.contactno = req.body.contact;
      console.log(profileValues);
      //do database stuff
      Profile.findOne({ user: user.id })
        .then((profile) => {
          if (profile) {
            Profile.findOneAndUpdate(
              { user: user.id },
              { $set: profileValues },
              { new: true }
            )
              .then((profile) => {
                res.redirect("/api/profile/?valid=" + token);
              })
              .catch((err) => console.log("Problem in update " + err));
          } else {
            res.json({ updateerror: "some error occured" });
          }
        })
        .catch((err) => console.log("Problem in fetching profile " + err));
    } else {
      return res.status(403).json({ message: "User not authorised" });
    }
  });
});


// this is the code for uploading image , there is err and not authorised is shown on console


router.post('/addprofilepic',(req,res)=>{
    
    //using verify to check my token
    jwt.verify(token, process.env.secret,(err,user)=>{
        if(err)
            return console.log("not authorised")
        upload(req,res, (error) =>{
        if(error){
            res.json({
                message: error
            })
        }
        else{
            const profileValues= {}
            profileValues.profilepic = `/myupload/${req.file.filename}`;
            Profile.findOne({user: user.id})
            .then(profile => {
            if(profile)     
            {
                Profile.findOneAndUpdate({user: user.id},{$set: profileValues}, {new: true})
                .then(profile => {
                console.log("Successful ff");
                })
                .catch(err => console.log("Problem in update "+err))       
            }else{
                res.json({updateerror: 'some error occured'})
            }

        })
        .catch(err => console.log("Problem in fetching profile "+err))
        }
    })  
})
})








//@type      GET
//@route     /api/profile/username/:username
//@desc      route for getting user profile based on username
//@access    PUBLIC
router.get("/username/:username", (req, res) => {
  Profile.findOne({ username: req.params.username })
    .then((profile) => {
      if (!profile) {
        res.status(404).json({ usernotfound: "User not found" });
      }
      res.json(profile);
    })
    .catch((err) => console.log("Error in fetching username " + err));
});

//@type      DELETE
//@route     /api/profile/delete
//@desc      route for deleting user based on ID
//@access    PRIVATE
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id });
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        Person.findOneAndRemove({ _id: req.user.id })
          .then(() => res.json({ success: "delete was successful" }))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

// need to edit below this

//@type      POST
//@route     /api/profile/edit/add/novel/
//@desc      route for adding workrole of a person
//@access    PRIVATE

router.post("/edit/add/novel/", (req, res) => {
  jwt.verify(token, process.env.secret, (err, user) => {
    if (!err) {
      Profile.findOne({ user: user.id })
        .then((profile) => {
          if (!profile) return res.json({ failure: "profile not found" });
          else {
            const newNovel = {
              name: req.body.name,
              author: req.body.author,
              genre: req.body.genre,
              details: req.body.details,
            };
            
            console.log(newNovel);
            let novels = profile.novel;
            novels.push(newNovel);
            console.log(novels);

            Profile.findOneAndUpdate(
                { user: user.id },
                { $set: {novel : novels} },
                { new: true }
              )
                .then((profile) => {
                  res.redirect("/api/profile/?valid=" + token);
                })
                .catch((err) => console.log("Problem in update " + err));
            }
          })
        .catch((err) => console.log(err));
    } else {
      return res.status(403).json({ message: "User not authorised" });
    }
  });
});

//@type      DELETE
//@route     /api/profile/edit/delete/novel
//@desc      route for deleting a workrole of a person
//@access    PRIVATE

router.delete(
  "/edit/delete/:w_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) res.json({ notfound: "Profile not found" });
        else {
          const removethis = profile.novel
            .map((item) => item.id)
            .indexOf(req.params.w_id);

          profile.novel.splice(removethis, 1);

          profile.findOneAndUpdate
            .then((profile) => res.json(profile))
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }
);

module.exports = router;
