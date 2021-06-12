const express = require('express')
const router= express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

//load person model
const Person = require("../../models/Person")

//load profile model
const Profile= require("../../models/Profile")
const { route } = require('./auth')

//static files
router.use(express.static("public"))

//@type      GET
//@route     /api/profile/
//@desc      route for personal user profile
//@access    PRIVATE

router.get('/',passport.authenticate('jwt',{session:false}), (req,res)=>{
    Profile.findOne({user: req.user.id})
    .then(
        profile =>{
            if(!profile) {
                return res.status(404).json({profilenotfound: "no profile found"})
            }
            res.json(profile)
        }
    )
    .catch( err => console.log("Got some error in profile "+err))
})

//@type      POST
//@route     /api/profile/edit/
//@desc      route for updating/saving user profile
//@access    PRIVATE

router.post('/edit/',passport.authenticate('jwt',{session:false}), (req,res)=>{
    const profileValues= {}
    if(req.body.name) profileValues.name = req.body.name
    if(req.body.address) profileValues.address = req.body.address
    
    //do database stuff
    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile)     //update
        {
            Profile.findOneAndUpdate({user: req.user.id},{$set: profileValues}, {new: true})
            .then(profile => res.json(profile))
            .catch(err => console.log("Problem in update "+err))
        }else{
            res.json({updateerror: 'some error occured'})
        }

    })
    .catch(err => console.log("Problem in fetching profile "+err))
}

)

//@type      GET
//@route     /api/profile/username/:username
//@desc      route for getting user profile based on username
//@access    PUBLIC
router.get('/username/:username',(req,res)=>{
    Profile.findOne({username: req.params.username})
    .then(profile => {
        if(!profile){
            res.status(404).json({usernotfound: 'User not found'})
        }
        res.json(profile)
    })
    .catch(err => console.log("Error in fetching username "+err));
})


//@type      DELETE
//@route     /api/profile/delete
//@desc      route for deleting user based on ID
//@access    PRIVATE
router.delete('/', passport.authenticate('jwt',{session: false}), (req,res)=>{
     Profile.findOne({user: req.user.id});
     Profile.findOneAndRemove({user: req.user.id})
    .then(()=>{
        Person.findOneAndRemove({_id: req.user.id})
        .then(() => res.json({success:'delete was successful'}))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})







// need to edit below this  





//@type      POST
//@route     /api/profile/edit/add/novel/
//@desc      route for adding workrole of a person
//@access    PRIVATE

router.post('/edit/add/novel/', passport.authenticate('jwt',{session:false}), (req,res)=>{
    Profile.findOne({user: req.user.id})
    .then( profile =>{
        if(!profile)
            return res.json({failure: 'profile not found'})
        else{
            const newNovel ={
                name: req.body.name,
                author: req.body.author,
                genre: req.body.country,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                details: req.body.details
            }
            profile.workrole.push(newWork)
            profile.save()
            .then(profile => res.json(profile))
            .catch(err => console.log(err))
        }

    })
    .catch(err => console.log(err))
})

//@type      DELETE
//@route     /api/profile/edit/delete/novel
//@desc      route for deleting a workrole of a person
//@access    PRIVATE

router.delete('/workrole/:w_id', passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user: req.user.id})
    .then( profile=>{
        if(!profile)
            res.json({notfound: 'Profile not found'})
        else{
            const removethis = profile.workrole
            .map(item => item.id)
            .indexOf(req.params.w_id)           //we have the index of id of workrole to be removed in removethis
            
            profile.workrole.splice(removethis, 1)

            profile.save()
            .then(profile => res.json(profile))
            .catch(err => console.log(err))

        }

    })
    .catch(err => console.log(err))
})

module.exports = router