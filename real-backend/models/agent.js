const mongoose = require("mongoose")

const AgentDetails = new mongoose.Schema({
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
    }
})

module.exports = mongoose.model("Agent", AgentDetails)