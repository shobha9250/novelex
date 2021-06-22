// npm install dotenv package then this is require statement 
// in even files we do not put our strings in semicolons i will send just paste in where index.js is
require('dotenv').config();
const express = require('express')
const ejs = require("ejs");
const path= require("path")
const bodyparser= require('body-parser')
const passport= require('passport')
const mongoose= require('mongoose')
const jwt = require("jsonwebtoken");
const Grid = require('gridfs-stream');


const app= express();
const port = process.env.PORT || 3000;

//bringing all routes
const auth = require('./routes/api/auth')
const profile = require('./routes/api/profile')

//static files
app.use(express.static("public"))

//middleware for body parser
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

//setting view engine
app.set("view engine","ejs")

//monogoDB configuration
const mongoDB = process.env.mongoURL

//connecting monoDB
mongoose
    .connect(mongoDB ,{ useNewUrlParser: true , useUnifiedTopology: true})
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.log(err))

 //passport middleware
app.use(passport.initialize())

//config for JWT strategy
require('./strategies/jsonwtstrategy')(passport)   

//load person model
const Person = require("./models/Person");

//load profile model
const Profile = require("./models/Profile");


//init gfs
let gfs;

const conn = mongoose.createConnection(process.env.mongoURL,{ useNewUrlParser: true , useUnifiedTopology: true});

conn.once('open',() => {
  //init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads')   //collection name
})


//@type      GET
//@route     /api/
//@desc      route for getting dashboard
//@access    PUBLIC/PRIVATE

let token;
app.get("/", (req, res) => {
    //getting token from query
    token = req.query.valid;
  
    Profile.find()
    .then((profiles)=> {
    
    jwt.verify(token, process.env.secret, (err, user) => {
      if (!err) {
        Profile.findOne({ user: user.id })
          .then((profile) => {
            if (!profile) {
              return res
                .status(404)
                .json({ profilenotfound: "no profile found" });
            }
  
            res.render("dashboard",({myprofile: profile, allprofiles: profiles, token:token}))
          })
          .catch((err) => console.log("Got some error in profile " + err));
      } else {
        res.render("dashboard",({myprofile:false, allprofiles:profiles, token:false}))
      }
    });

    })
    .catch((err) =>console.log("error"))
});


app.get("/:username", (req, res) => {
  token = req.query.valid;
  Profile.findOne({ username: req.params.username })
    .then((reqprofile) => {
      if (!reqprofile) {
        res.status(404).json({ usernotfound: "User not found" });
      }
      jwt.verify(token, process.env.secret, (err, user) => {
        if (!err) {
          Profile.findOne({ user: user.id })
            .then((myprofile) => {
              if (!myprofile) {
                return res
                  .status(404)
                  .json({ profilenotfound: "no profile found" });
              }
              res.render("public_profile",({myprofile:myprofile, reqprofile:reqprofile ,token:token}))
    
    
            })
            .catch((err) => console.log("Got some error in profile " + err));
        } else {
          res.render("public_profile",({myprofile:false, reqprofile:reqprofile ,token:false}))
        }
      });

    })
    .catch((err) => console.log("Error in fetching username " + err));
});


app.get('/:username/image/:filename', (req,res) => {
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


  app.get('/image/:filename', (req,res) => {
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


//actual routes
app.use('/api/auth',auth)
app.use('/api/profile',profile)

module.exports = gfs;

app.listen(port, (req,res)=> console.log(`Server is running at ${port}...`))