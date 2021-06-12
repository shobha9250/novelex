const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProfileSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,      
        ref:"myPerson"      
    },
    username:{
        type: String,
        max:50
    },
    name:{
        type: String,
        required: true,
    },
    address:{
        type: String,
        required: true,
    },
    profilepic:  {
        type : String,
        default : "https://k2partnering.com/wp-content/uploads/2016/05/Person.jpg"
    },
    novel: [
        {
            name: {
                type:String,
                required:true
            },
            novelpic:{
                type: String,
                default: ""
            },
            author: {
                type:String
            },
            genre:[
                    {
                    type:String,
                }
            ],
            details: {
                type:String
            }
        }
    ],
    myGenre:[{
        type: String
    }],
    date: {
        type: Date,
        default: Date.now
    }

})

module.exports= Profile =mongoose.model("myProfile",ProfileSchema)