const express = require('express')
const ejs = require("ejs");
const path= require("path")

const app= express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.set("view engine","ejs");

app.get('/',(req,res)=>{
    res.render("login")
})

app.get('/login',(req,res)=>{
    res.render("login");
})

app.listen(port, (req,res)=> console.log(`Server is running at ${port}...`))