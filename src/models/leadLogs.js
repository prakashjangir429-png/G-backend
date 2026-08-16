// models/Lead.js
import mongoose, { Schema } from 'mongoose';

const leadlogsSchema = new Schema(
    {
        type: {
            type: String,
            enum: [
                "call",
                "meeting",
                "message",
                "note",
                "status_change",
                "task",
                "website_visit",
                "document_upload",
                "assignment"
            ],
            required: true,
            index: true
        },
        title: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        callDetails: {
            callerId: String,
            duration: Number, // seconds
            status: String,
            recordingUrl: String,
            ivrSTime: {
                type: Date,
            },
            ivrETime: {
                type: Date,
            },
            callType: {
                type: String
            },
            callPurpose: {
                type: String
            }
        },
        status: {
            type: String,
        },
        meetingDetails: {
            link: String,
            scheduledAt: Date,
            joinedAt: Date,
            joinedBy: String,
            status: {
                type: String,
                enum: ["scheduled", "joined", "completed", "cancelled"]
            }
        },
        messageDetails: {
            channel: {
                type: String,
                enum: ["sms", "whatsapp", "email"]
            },
            content: String,
            direction: {
                type: String,
                enum: ["sent", "received"]
            }
        },
        // statusChange: {
        //     from: String,
        //     to: String
        // },
        websiteDetails: {
            url: String,
            timeSpent: Number, // in seconds
            source: String
        },
        phone: {
            type: String,
            trim: true,
        },
        masterCallNumber: {
            type: String,
            trim: true
        },
        extraDetails: {
            type: Schema.Types.Mixed,
            default: {}
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },

    {
        timestamps: true,
        toObject: { virtuals: true }
    }
);

leadlogsSchema.index({ phone: 1 });
leadlogsSchema.index({ type: 1 });

export const Leadlogs = mongoose.model('LeadLog', leadlogsSchema);