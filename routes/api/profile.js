require("dotenv").config();
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const cookies = require('cookie-parser');

//load person model
const Person = require("../../models/Person");

//load profile model
const Profile = require("../../models/Profile");

//load novel model
const Novel = require("../../models/Novel");

const { route, connect } = require("./auth");
const { JsonWebTokenError } = require("jsonwebtoken");
const { rejects } = require("assert");
const { resolve } = require("path");

//static files
router.use(express.static("public"));
router.use(cookies());

// //init gfs
let gfs;

const conn = mongoose.createConnection(process.env.mongoURL,{ useNewUrlParser: true , useUnifiedTopology: true});

conn.once('open',() => {
  //init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads')   //collection name
})

//create storage engine
const storage = new GridFsStorage({
  url:process.env.mongoURL,
  file: (req,file) => {
    return new Promise((resolve,reject)=>{
      crypto.randomBytes(16, (err, buf) => {
        if(err){
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'   //should match the collection name
        };
        resolve(fileInfo);
      })
    })
  }
})
const uploadprofileimage =multer({storage}).single("profileimage");
const uploadnovelimage =multer({storage}).single("novelimage");

//@type      GET
//@route     /api/profile/
//@desc      route for personal user profile
//@access    PRIVATE

let token
router.get("/", (req, res) => {
  //getting token from query
  token = req.cookies['token'];

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
            Novel.find()
            .then((novels) => {
              let mynovels= [];
              mynovels= novels.filter(novel =>{
                if(novel.user._id == user.id){
                  return novel;
                  }
              })
              
              
              res.render("profile", {profile:profile, mynovels:mynovels, token:token});
              
            })
            .catch((err)=> console.log(err))

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
      if (req.body.myGenre) profileValues.myGenre = req.body.myGenre;
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
                res.redirect("/api/profile");
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
        uploadprofileimage(req,res, (error) =>{
          if(error){
            res.json({
              message: error
            })
            }
            else{
              const profileValues= {}
              if(req.file)
                profileValues.profilepic = `${req.file.filename}`;
              Profile.findOne({user: user.id})
              .then(profile => {
              if(profile)     
                {
                      Profile.findOneAndUpdate({user: user.id},{$set: profileValues}, {new: true})
                      .then(profile => {
                      console.log("Successful ff");
                      res.redirect("/api/profile");
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
//@route     /api/profile/profileimage/:filename
//@desc      route for getting user profile pic based on filename
//@access    PUBLIC
// This route is used in ejs also

router.get('/image/:filename', (req,res) => {
  gfs.files.findOne({filename : req.params.filename},(err,file) => {
    if(!file || file.length ===0){
      return res.status(404).json({
        err:'no file exists'
      })
    }

    if(file.contentType === 'image/jpeg' || file.contentType=== 'image/png'){
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    }
  })
})




//@type      POST
//@route     /api/profile/edit/add/novel/
//@desc      route for adding workrole of a person
//@access    PRIVATE

router.post("/edit/add/novel/", uploadnovelimage, (req, res) => {
  jwt.verify(token, process.env.secret, (err, user) => {
    if (!err) {
      Profile.findOne({ user: user.id })
        .then((profile) => {
          if (!profile) return res.json({ failure: "profile not found" });
          else {
            const newNovel = new Novel({
              name: req.body.name,
              author: req.body.author,
              genre: req.body.genre,
              details: req.body.details,
              user: user.id
            });
            if(req.file){
              newNovel.novelpic= req.file.filename
            }
            
            newNovel.save()
                .then((novel) => {
                  res.redirect("/api/profile");
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

//@type      POST
//@route     /api/profile/removenovel
//@desc      route for deleting a workrole of a person
//@access    PRIVATE

router.post("/removenovel", (req, res) => {
  jwt.verify(token, process.env.secret, (err, user) => {
    if(err){
      res.redirect("/api/auth/login");
    }
    
    Novel.findOne({name: req.body.toberemoved});
     Novel.findOneAndRemove({name: req.body.toberemoved})
    .then(()=>{
        Novel.findOneAndRemove({name: req.body.toberemoved})
        .then(() => res.redirect('/api/profile'))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))

  })
});


module.exports = router