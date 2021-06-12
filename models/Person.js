const mongoose= require('mongoose')
const Schema= mongoose.Schema

const PersonSchema = new Schema({
    email:  {
        type : String,
        required: true,
    },
    password:  {
        type : String,
        required: true,
    },
    username:  {
        type : String,
        required: true
    },
})

module.exports = Person = mongoose.model("myPerson", PersonSchema)