const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NovelSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
    },
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
})

module.exports= Novel =mongoose.model("myNovel",NovelSchema)