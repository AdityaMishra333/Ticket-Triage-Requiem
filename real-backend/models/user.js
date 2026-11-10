const mongoose = require("mongoose")

const UserDetails = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },

    email : {
        type : String,
        required : true,
        unique : true
    },

    password : {
        type : String,
    },

    role : {
        type : String,
        default : "user"
    },

    failedLoginAttempts : {
        type : Number,
        default : 0
    },

    lockUntil : {
        type : Date,
        default : null
    }
})

module.exports = mongoose.model("User", UserDetails)