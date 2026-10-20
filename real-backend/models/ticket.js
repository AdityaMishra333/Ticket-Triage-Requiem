const mongoose = require("mongoose")

const TicketDetails = new mongoose.Schema({
    ticketId : {
        type : String,
        required : true,
        unique : true
    },

    customerName : {
        type : String,
        required : true
    },

    subject : {
        type : String,
        required : true
    },

    item : {
        type : String,
        required : true
    },

    serviceDate : {
        type : Date,
        required : true
    },

    description : {
        type : String,
        required : true
    },

    contactDetails : {
        type : String,
        required : true
    },

    status : {
        type : String,
        default : "pending"
    },

    category : {
        type : String
    },

    priority : {
        type : String
    },

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
}, { timestamps : true })

module.exports = mongoose.model("Ticket", TicketDetails)
