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
    myGenre:{
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }

})

module.exports= Profile =mongoose.model("myProfile",ProfileSchema)