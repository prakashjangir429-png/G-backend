import cron from "node-cron";
import fetch from "node-fetch";
import { Lead } from "../models/Leads.js";
import wslogsModal from "../models/wslogsModal.js";

// ====================== PIPELINE ======================
const pipeline = {
    "name": "Study Visa AI Automation",

    "settings": {
        "replyDelayMinutes": 5,
        "maxNoReplyHours": 24,
        "autoAssignScore": 70,
        "autoCallScore": 90,
        "humanTone": true,
        "useTemplatesFirst": true
    },

    "stages": [
        {
            "id": "new",
            "name": "New Lead",
            "onEnter": [
                { "type": "SEND_TEMPLATE", "template": "newequiry", "delayMinutes": 1 }
            ],
            "followups": [
                { "if": "NO_REPLY", "afterHours": 3, "type": "SEND_TEMPLATE", "template": "newenquiry2" },
                { "if": "NO_REPLY", "afterHours": 24, "type": "MOVE_STAGE", "moveTo": "NOT_REACHABLE" }
            ],
            "aiRules": {
                "detectIntent": true,
                "moveToInterestedIf": ["fees", "visa", "scholarship", "country_interest", "call_request"]
            },
            "next": {
                "INTERESTED": "INTERESTED",
                "NOT_REACHABLE": "NOT_REACHABLE"
            }
        },
        {
            "id": "INTERESTED",
            "name": "Interested Lead",
            "onEnter": [
                { "type": "SEND_TEMPLATE", "template": "connected", "delayMinutes": 2 }
            ],
            "followups": [
                { "afterHours": 24, "type": "SEND_TEMPLATE", "template": "connected_follow_up_" },
                { "afterHours": 48, "type": "AI_MESSAGE", "goal": "social_proof" },
                { "afterHours": 96, "type": "SEND_TEMPLATE", "template": "connected_urgency_" },
                { "if": "NO_REPLY", "afterHours": 120, "type": "MOVE_STAGE", "moveTo": "FOLLOW_UP" }
            ],
            "aiRules": {
                "assignCounsellorScore": 70,
                "autoCallScore": 90
            },
            "next": {
                "HOT": "HOT",
                "FOLLOW_UP": "FOLLOW_UP",
                "CONVERTED": "CONVERTED"
            }
        },
        {
            "id": "NOT_REACHABLE",
            "name": "Not Reachable",
            "onEnter": [
                { "type": "SEND_TEMPLATE", "template": "notreachable", "delayHours": 24 }
            ],
            "followups": [
                { "afterHours": 48, "type": "SEND_TEMPLATE", "template": "notreachable_valueadd_" },
                { "afterHours": 96, "type": "SEND_TEMPLATE", "template": "notreachable_lighturgency_" },
                { "if": "NO_REPLY", "afterHours": 144, "type": "MOVE_STAGE", "moveTo": "FUTURE" }
            ],
            "next": {
                "INTERESTED": "INTERESTED",
                "FUTURE": "FUTURE"
            }
        },
        {
            "id": "FOLLOW_UP",
            "name": "Follow Up",
            "followups": [
                { "afterHours": 24, "type": "AI_MESSAGE", "goal": "followup" },
                { "afterHours": 72, "type": "AI_MESSAGE", "goal": "value_add" },
                { "afterHours": 120, "type": "AI_MESSAGE", "goal": "breakup" },
                { "if": "NO_REPLY", "afterHours": 144, "type": "MOVE_STAGE", "moveTo": "FUTURE" }
            ],
            "next": {
                "INTERESTED": "INTERESTED",
                "FUTURE": "FUTURE"
            }
        },
        {
            "id": "FUTURE",
            "name": "Future Leads",
            "monthlyFlow": [
                { "week": 1, "goal": "education" },
                { "week": 2, "goal": "opportunity" },
                { "week": 3, "goal": "social_proof" },
                { "week": 4, "goal": "soft_conversion" }
            ],
            "rotation": {
                "countries": ["Germany", "UK", "Canada", "Australia", "France"],
                "angles": ["fees", "scholarship", "visa", "jobs", "pr"]
            },
            "next": { "INTERESTED": "INTERESTED" }
        },
        {
            "id": "HOT",
            "name": "Hot Lead",
            "onEnter": [
                { "type": "AUTO_CALL" },
                { "type": "ASSIGN_COUNSELLOR" }
            ],
            "followups": [
                { "afterHours": 2, "type": "AI_MESSAGE", "goal": "close_conversion" }
            ],
            "next": { "CONVERTED": "CONVERTED" }
        },
        {
            "id": "CONVERTED",
            "name": "Converted",
            "stopAutomation": true,
            "onEnter": [
                { "type": "SEND_TEMPLATE", "template": "offer_letter" }
            ]
        }
    ]
};

// ====================== HELPER ======================
const normalizeIndianPhone = (number) => {
    if (!number) return null;
    let phone = String(number).trim();
    phone = phone.replace(/\D/g, "");
    if (phone.startsWith("91") && phone.length > 10) phone = phone.slice(-10);
    if (phone.startsWith("0") && phone.length > 10) phone = phone.slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) {
        if (phone.length > 10) phone = phone.slice(-10);
    }
    if (!/^[6-9]\d{9}$/.test(phone)) return null;
    return phone;
};

function fallbackAIResponse(lead) {
    return {};
}

// ====================== MAIN AI ENGINE ======================
export async function runLeadAutomationAI({
    lead,
    conversationHistory = [],
    pipelineFlow = pipeline
}) {

    const prompt = `You are an advanced AI CRM automation engine for a Gateway abroad education.
    you have to give complete output not truncate the output.
You must follow the automation workflow strictly.
========================================================================
AUTOMATION RULES
========================================================================
NEW LEAD FLOW:
- Respond within 5 minutes
- Ask preferred country
- Ask if user wants counsellor
- If no reply after few hours → follow-up
- If still no reply → move to NOT_REACHABLE

INTERESTED FLOW:
- User showed interest
- Share fees / scholarship / visa guidance
- Offer counsellor call
- Build urgency
- Daily follow-up

NOT REACHABLE FLOW:
- Send soft reminder
- Add value
- Re-engage
- If still no reply → move FUTURE

FUTURE LEADS FLOW:
- Soft nurturing
- Monthly education
- Scholarship updates
- PR opportunities
- Social proof
- Never hard sell

FOLLOW-UP FLOW:
- Continue reminders
- Create urgency
- Try call booking
- If inactive → move FUTURE

========================================================================
PIPELINE FLOW JSON
========================================================================
${JSON.stringify(pipelineFlow, null, 2)}

========================================================================
LEAD DATA
========================================================================
${JSON.stringify(lead, null, 2)}

========================================================================
CONVERSATION HISTORY
========================================================================
${JSON.stringify(conversationHistory, null, 2)}

========================================================================
YOUR TASK
========================================================================
Analyze: user intent, lead temperature, buying intent, country interest, urgency, stage progression
Decide: next stage, best action, best reply, template usage, auto call, follow-up timing

company detail : Gateway abroad

IMPORTANT:
- Use templates whenever possible
- Use text only when personalization needed
- Keep messages human-like
- Avoid robotic responses
- Do NOT hard sell
- Keep response concise

========================================================================
RETURN STRICT JSON ONLY
========================================================================
{
  "intent": "",
  "leadTemperature": "",
  "currentStage": "",
  "nextStage": "",
  "actionType": "",
  "templateName": "",
  "replyMessage": "",
  "autoCall": false,
  "followupAfterHours": 0,
  "leadScore": 0,
  "tags": []
}
  CRITICAL RULES:
- Return ONLY raw JSON
- No markdown
- No explanation
- No reasoning
- No thinking
- No notes
- No text outside JSON
- Always close JSON properly
- Keep response under 400 tokens

VALID ACTION TYPES: SEND_TEMPLATE, SEND_MESSAGE, AUTO_CALL, MOVE_STAGE, WAIT, END_FLOW
VALID LEAD TEMPERATURES: HOT, WARM, COLD
VALID STAGES: new, INTERESTED, NOT_REACHABLE, FOLLOW_UP, FUTURE, HOT, CONVERTED`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer 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`,
                "Content-Type": "application/json",
                "X-Title": "Study Visa CRM Automation"
            },
            body: JSON.stringify({
                model: "arcee-ai/trinity-large-thinking:free" || "baidu/cobuddy:free",
                max_tokens: 400,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: "You are an expert AI WhatsApp CRM automation engine." },
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("AI API Error:", err);
            return fallbackAIResponse(lead);
        }

        const data = await response.json();

        const aiMessage = data?.choices[0]?.message;

        let text = "";

        if (aiMessage.content) {
            text = aiMessage.content;
        }

        else if (aiMessage.reasoning) {
            text = aiMessage.reasoning;
        }

        text = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").replace(/```json/g, "")
            .replace(/```/g, "");

        const ai = JSON.parse(text);

        return {
            intent: ai.intent || "UNKNOWN",
            leadTemperature: ai.leadTemperature || "COLD",
            currentStage: ai.currentStage || lead.secondaryStatus || lead.status,
            nextStage: ai.nextStage || lead.secondaryStatus || lead.status,
            actionType: ai.actionType || "WAIT",
            templateName: ai.templateName || "",
            replyMessage: ai.replyMessage || "",
            autoCall: Boolean(ai.autoCall),
            followupAfterHours: Number(ai.followupAfterHours) || 24,
            leadScore: Number(ai.leadScore) || 0,
            tags: Array.isArray(ai.tags) ? ai?.tags : []
        };

    } catch (err) {
        console.error("AI Automation Error:", err.message);
        return fallbackAIResponse(lead);
    }
}

// ====================== EXECUTE AUTOMATION ======================
export async function executeAutomation({
    lead,
    aiResult,
    updateLead
}) {

    const updates = {
        automationStatus: aiResult.nextStage,
        leadScore: aiResult.leadScore,
        nextAutomationAt: new Date(Date.now() + aiResult.followupAfterHours * 60 * 60 * 1000),
        extraDetails: {
            ...(lead.extraDetails || {}),
            pipelinePhase: aiResult.nextStage,
            lastAIAction: aiResult.actionType,
            lastAIIntent: aiResult.intent,
            lastTemperature: aiResult.leadTemperature,
            lastProcessedAt: new Date()
        }
    };

    // Execute Action
    if (aiResult.actionType === "SEND_TEMPLATE" && aiResult.templateName) {
        await sendTemplateMessage({
            phone: lead.phone,
            templateName: aiResult.templateName,
            variables: [lead.fullName || "Student"]
        });
    }

    if (aiResult.actionType === "SEND_MESSAGE" && aiResult.replyMessage) {
        await sendTextMessage(lead.phone, aiResult.replyMessage);
    }

    if (aiResult.autoCall && aiResult.leadScore >= pipeline.settings.autoCallScore) {
        await autoDialCounsellor({ lead });
        updates.extraDetails.autoCallTriggered = true;
    }

    if (aiResult.nextStage === "CONVERTED") {
        updates.extraDetails.automationStopped = true;
    }

    await updateLead(lead._id, updates);
    return aiResult;
}

export async function handleIncomingWhatsApp(req, res) {
    try {
        const { from, message } = req.body; // Adjust according to your WhatsApp provider

        if (!from || !message) return res.status(400).send("Missing data");

        const phone10 = normalizeIndianPhone(from);
        if (!phone10) return res.status(400).send("Invalid phone");

        let lead = await Lead.findOne({ phone10 });

        if (!lead) {
            lead = await Lead.create({
                fullName: "WhatsApp User",
                phone: from,
                phone10: phone10,
                source: "whatsapp",
                status: "new",
                secondaryStatus: "new",
                extraDetails: { firstContactVia: "whatsapp" }
            });
        }

        // Save user message
        await wslogsModal.create({
            phoneNumber: phone10,
            sender: "user",
            message: typeof message === 'string' ? message : message.body || message.text || JSON.stringify(message),
            timestamp: new Date()
        });

        // Get recent history
        const conversationHistory = await wslogsModal
            .find({ phoneNumber: phone10 })
            .sort({ createdAt: -1 })
            .limit(30);

        // Run AI
        const aiResult = await runLeadAutomationAI({ lead, conversationHistory });

        // Execute
        await executeAutomation({
            lead,
            aiResult,
            sendTextMessage: req.sendTextMessage || console.log,   // Pass your actual functions
            sendTemplateMessage: req.sendTemplateMessage || console.log,
            updateLead: async (id, data) => await Lead.findByIdAndUpdate(id, data),
            autoDialCounsellor: req.autoDialCounsellor || console.log
        });

        res.status(200).send("OK");
    } catch (err) {
        console.error("WhatsApp Webhook Error:", err);
        res.status(500).send("Error");
    }
}

cron.schedule("*/20 * * * * *", async () => {
    console.log("🚀 AI Nurturing Cron Started -", new Date().toISOString());

    try {
        const leads = await Lead.find({
            status: "new",
        }).sort({ createdAt: -1 }).limit(1);

        console.log(leads)

        for (const lead of leads) {
            try {
                const history = await wslogsModal
                    .find({ phoneNumber: lead.phone10 })
                    .sort({ createdAt: -1 })
                    .limit(40);

                const aiResult = await runLeadAutomationAI({ lead, conversationHistory: history });

                console.log(aiResult);

                return;

                await executeAutomation({
                    lead,
                    aiResult,
                    updateLead: async (id, data) => await Lead.findByIdAndUpdate(id, data),
                });
            } catch (e) {
                console.error(`Error processing lead ${lead.phone10}:`, e.message);
            }
        }
        console.log(`✅ Processed ${leads.length} leads`);
    } catch (err) {
        console.error("❌ Cron Error:", err.message);
    }
});

console.log("✅ Study Visa AI Automation Module Loaded");