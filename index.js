// npm install dotenv package then this is require statement 
// in even files we do not put our strings in semicolons i will send just paste in where index.js is
require('dotenv').config();
const express = require('express')
const ejs = require("ejs");
const path= require("path")
const bodyparser= require('body-parser')
const passport= require('passport')
const mongoose= require('mongoose')


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


app.get('/',(req,res)=>{
    res.render("home")
})


//actual routes
app.use('/api/auth',auth)
app.use('/api/profile',profile)

app.listen(port, (req,res)=> console.log(`Server is running at ${port}...`))