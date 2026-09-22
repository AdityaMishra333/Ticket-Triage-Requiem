const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
    {
        ticketId: {
            type: String,
            unique: true,
            required: true
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        contactDetails: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            default: null
        },

        urgency: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: null
        },

        sentiment: {
            type: String,
            enum: ["positive", "neutral", "negative"],
            default: null
        },

        summary: {
            type: String,
            default: null
        },

        suggestedTeam: {
            type: String,
            default: null
        },

        draftReply: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: [
                "submitted",
                "classified",
                "awaiting_approval",
                "resolving",
                "resolved",
                "needs_human"
            ],
            default: "submitted"
        },

        slaDeadline: {
            type: Date,
            default: null
        },

        escalated: {
            type: Boolean,
            default: false
        },

        statusHistory: [
            {
                status: {
                    type: String,
                    required: true
                },

                timestamp: {
                    type: Date,
                    default: Date.now
                },

                actor: {
                    type: String,
                    default: "system"
                }
            }
        ],

        csatScore: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },

        createdAt: {
            type: Date,
            default: Date.now
        },

        resolvedAt: {
            type: Date,
            default: null
        }
    }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;