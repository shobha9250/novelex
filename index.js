//logout feature
//searching a user with username , add this option
//searching novels for a particular genre




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
const cookies = require('cookie-parser');


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
app.use(cookies())

//setting view engine
app.set("view engine","ejs")

//monogoDB configuration
const mongoDB = process.env.mongoURL

//connecting monoDB
mongoose
    .connect(mongoDB ,{ useNewUrlParser: true , useUnifiedTopology: true})
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.log(err))


//load person model
const Person = require("./models/Person");

//load profile model
const Profile = require("./models/Profile");

const Novel = require("./models/Novel");


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
    token = req.cookies['token'];
  
    Novel.find()
    .populate('user', ['username'])
    .then((novels)=> {
    jwt.verify(token, process.env.secret, (err, user) => {
      if (!err) {
        Profile.findOne({ user: user.id })
          .then((profile) => {
            if (!profile) {
              return res
                .status(404)
                .json({ profilenotfound: "no profile found" });
            }
            
            

            res.render("dashboard",({myprofile: profile, token:token, allnovels:novels}))
          })
          .catch((err) => console.log("Got some error in profile " + err));
      } else {
        res.render("dashboard",({myprofile:false, token:false, allnovels:novels}))
      }
    });

    })
    .catch((err) => console.log(err))
});

app.post("/finduser", (req,res) => {
  const finduser = req.body.find_user;
  res.redirect(`/user/${finduser}`);
})

app.get("/user/:username", (req, res) => {
  token = req.cookies['token'];
  Profile.findOne({ username: req.params.username })
    .then((reqprofile) => {
      if (!reqprofile) {
        res.status(404).json({ usernotfound: "User not found" });
      }
      
      let reqnovels=[];
      
      Novel.find()
      .then((novels) => {
        reqnovels= novels.filter( (novel)=>{
          if(novel.user._id.toString() == reqprofile.user._id.toString()){
            return novel;
            
          }
        })
        

        jwt.verify(token, process.env.secret, (err, user) => {
          if (!err) {
            Profile.findOne({ user: user.id })
              .then((myprofile) => {
                if (!myprofile) {
                  return res
                    .status(404)
                    .json({ profilenotfound: "no profile found" });
                }
                
                
                res.render("public_profile",({myprofile:myprofile, reqprofile:reqprofile ,token:token, reqnovels:reqnovels}))
      
      
              })
              .catch((err) => console.log("Got some error in profile " + err));
          } else {
            
            res.render("public_profile",({myprofile:false, reqprofile:reqprofile ,token:false, reqnovels:reqnovels}))
          }
        });

      })
      .catch((err)=> console.log(err));
     

      

    })
    .catch((err) => console.log("Error in fetching username " + err));
});


app.get('/image/:filename', (req,res) => {
    if(!gfs)
      return console.log("error tt");
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