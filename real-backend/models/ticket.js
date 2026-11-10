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

    problem : {
        type : String,
        required : true
    },

    yourEmail : {
        type : String,
        required : true
    },

    status : {
        type : String,
        default : "new"
    },

    category : {
        type : String
    },

    urgency : {
        type : String
    },

    submittedAt : {
        type : Date,
        default : Date.now
    },

    draftReply : {
        type : String
    },

    escalated : {
        type : Boolean,
        default : false
    },

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },

    department : {
        type : String
     },

    statusHistory : [{
      status : String,
      note : String,
      actor : String,
      updatedAt : { type : Date, default : Date.now }
}],
}, { timestamps : true })

module.exports = mongoose.model("Ticket", TicketDetails)
