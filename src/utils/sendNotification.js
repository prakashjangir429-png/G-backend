import { Lead } from "../models/Leads.js";
import User from "../models/User.js";


const sendMessageToUser = (lead, userId, msg, phoneNumber) => {

    if (!global.io) {
        console.warn("Socket.io not initialized. Cannot send notification.");
        return;
    }

    const leadNamespace = global.io.of("/lead-notifications");

    leadNamespace
        .to(userId.toString())
        .emit("leadAssigned", {
            leadId: lead?._id?.toString() || Date.now().toString(),
            name: lead?.fullName || "Unknown",
            phone: lead?.phone || phoneNumber,
            type: "message",
            message: `New message from ${lead?.fullName || phoneNumber}: ${msg.substring(0, 100)}...`,
            createdAt: new Date()
        })
}

export const sendNotification = async (phoneNumber, msg) => {
    const lead = await Lead.findOne({ phone10: phoneNumber }).lean();

    const counselorId = lead?.assignedCounselor;
    const [admins] = await Promise.all([User.find({ role: "admin", isActive: true })]);

    admins.forEach((admin) => {
        sendMessageToUser(lead, admin._id, msg, phoneNumber);
    });

    if (counselorId) {
        sendMessageToUser(lead, counselorId, msg, phoneNumber);
        return;
    }
}

