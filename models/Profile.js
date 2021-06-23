const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProfileSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,      
    },
    username:{
        type: String,
        max:50
    },
    name:{
        type: String,
        default:""
    },
    address:{
        type: String,
        default:""
    },
    contactno:{
        type: String,
        default:""
    },
    profilepic:  {
        type : String,
        default : "1a9b159534ebf0fbae07f80fdffa4968.jpeg"
    },
    novel: [
        {
            name: {
                type:String,
                required:true
            },
            novelpic:{
                type: String,
                default: "36e48cc164a2701c8e8c9128f0d89440.png"
            },
            author: {
                type:String
            },
            genre:{
                type: String,
            },
            details: {
                type:String
            }
        }
    ],
    myGenre:{
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }

})

module.exports= Profile =mongoose.model("myProfile",ProfileSchema)