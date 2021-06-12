const jwtStrategy = require('passport-jwt').Strategy
const Extractjwt = require('passport-jwt').ExtractJwt
const mongoose = require('mongoose')
const Person = mongoose.model("myPerson")
const myKey= require('../setup/myurl')

var opts ={}
opts.jwtFromRequest =Extractjwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = myKey.secret

module.exports =passport => {
    passport.use( new jwtStrategy(opts, (jwt_payload,done)=> {
        Person.findById(jwt_payload.id)
        .then(person =>{
            if(person){
                return done(null,person)       
            }
            return done(null,false)
        })
        .catch(err => console.log(err))
    }))
}

