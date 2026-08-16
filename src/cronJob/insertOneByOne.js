import mongoose from "mongoose";
import { Lead } from "../models/Leads.js";
import cron from "node-cron";


// Parse messy status strings like "No Answer 1,no answer 2 - 19/3/36"
const parseStatusAndNotes = (rawStatus) => {
  if (!rawStatus || rawStatus.trim() === '') {
    return { status: 'new', note: null };
  }

  const raw = rawStatus.toLowerCase().trim();

  // === INTERESTED variations ===
  if (raw.includes('interested')) {
    if (raw.includes('but') || raw.includes('later') || raw.includes('busy') || raw.includes('tomorrow') || raw.includes('tom')) {
      return { status: 'followup', note: rawStatus.trim() };
    }
    return { status: 'interested', note: null };
  }

  // === NOT REACHABLE variations ===
  const notReachableKeywords = [
    'no answer', 'not reachable', 'not reachabale', 'not reachble', // typos
    'wrong number', 'disconnected', 'voice mail', 'voicemail',
    'couldn\'t hear', 'could not hear', 'call later', 'busy now',
    'called thrice', 'no response', 'not connecting'
  ];

  if (notReachableKeywords.some(keyword => raw.includes(keyword))) {
    return { status: 'notReachable', note: rawStatus.trim() };
  }

  // === NOT INTERESTED ===
  if (raw.includes('not interested')) {
    return { status: 'notInterested', note: null };
  }

  // === REJECTED ===
  if (raw.includes('rejected') || raw.includes('not eligible')) {
    return { status: 'rejected', note: rawStatus.trim() };
  }

  // === FOLLOW UP (generic busy/come-back-later) ===
  if (raw.includes('call later') || raw.includes('busy') || raw.includes('tomorrow') || raw.includes('next week')) {
    return { status: 'followup', note: rawStatus.trim() };
  }

  // === DEFAULT ===
  return { status: 'new', note: rawStatus.trim() };
};
// Map messy "Country " field values to LEAD_STATUSES enum
const mapCountryToStatus = (rawValue) => {

  console.log(rawValue)

  if (!rawValue || rawValue.trim() === '') return 'new';

  const raw = rawValue.toLowerCase().trim();

  // Direct matches
  if (raw === 'interested') return 'interested';
  if (raw === 'rejected') return 'rejected';
  if (raw === 'future intake') return 'futureLeads';

  // "Not Interested" variations
  if (raw.includes('not interested')) return 'notInterested';

  // "Not Reachable" variations (typos included)
  const notReachableKeywords = [
    'not answered', 'not asnwered', 'not asnswered', // typos
    'not connecting', 'not inconnecting', // typos
    'not reached', 'wrong number',
    'answered but his parent picked', // couldn't reach student directly
    'not reachable', 'unreachable', 'no response'
  ];
  if (notReachableKeywords.some(keyword => raw.includes(keyword))) {
    return 'notReachable';
  }

  // "Interested but..." variations → still interested, needs followup
  if (raw.includes('interested') && raw.includes('but')) {
    return 'followup'; // or 'interested' based on your workflow
  }

  // Default fallback
  return 'new';
};
// Helper to map raw status strings to LEAD_STATUSES enum values
const mapStatus = (rawStatus) => {
  if (!rawStatus) return 'new';

  const statusMap = {
    'not reachable': 'notReachable',
    'not interested': 'notInterested',
    'follow up': 'followup',
    'interested': 'interested',
    'future': 'futureLeads',
    'new': 'new',
    '': 'new'
  };

  const normalized = rawStatus.toLowerCase().trim();
  return statusMap[normalized] || 'new';
};

const baseDate = new Date("2026-03-19T08:00:00Z");
let leadCounter = 0; // 🔥 global counter

const getCreatedAt = () => {
  const date = new Date(baseDate);
  date.setMinutes(date.getMinutes() + leadCounter * 3);
  leadCounter++; // 🔥 increment after each use
  return date;
};

const createdAt = getCreatedAt();
let count = 0
let assignCount = 0
const insertSingleLead = async (lead, counselorId) => {

  if (!counselorId) {
    console.log("⚠️ No counselor ID provided");
    return
  }

  // console.log(lead)
  // const { status, note } = parseStatusAndNotes(lead["Status  19/3/26"]);
  try {
    const formattedLead = {
      fullName: lead["full_name"],
      phone: lead["phone_number"],
      email: lead["email"],
      city: lead.city,
      // notes: lead["note"]?.trim()
      //   ? [{
      //     text: lead["note"].trim(),
      //     createdBy: new mongoose.Types.ObjectId(counselorId),
      //     createdAt: createdAt
      //   }]
      //   : [],
      extraDetails: {
        importedAt: new Date().toISOString()
      },
      coursePreference: lead?.course || "unfilled",
      assignedCounselor: new mongoose.Types.ObjectId(counselorId),
      source: "metaAds"
    };

    const phone10 = String(formattedLead.phone).replace(/\D/g, "").slice(-10);

    console.log(phone10)

    const isExisting = await Lead.findOne({
      phone: { $regex: `${phone10}$` } // ends with last 10 digits
    });

    if (isExisting) {
      count = count + 1
      console.log(`⚠️ Lead already exists for counselor ${isExisting._id}`);
      return;
    }
    // if(assignCount > 9){
    //   return
    // }

    const inserted = await Lead.create(formattedLead);
    if (inserted) {
      assignCount = assignCount + 1
    }
    console.log(`✅ Lead inserted for counselor ${counselorId}`);
    return;

  } catch (error) {
    console.error("❌ Error inserting lead:", error);
  } finally {
    console.log(count)
    console.log("assignCount ::---" + assignCount)
  }
};

const kjkjk = [
  {
    "full_name": "Shiny Jacklin",
    "phone_number": "9945773406",
    "email": "shinyjacklin0811@gmail.com",
    "": "",
    "city": "Banglure"
  },
  {
    "full_name": "Nandhitha sree",
    "phone_number": "9392108508",
    "email": "nandhithasree567@gmail.com",
    "": "",
    "city": "NAN"
  },
  {
    "full_name": "Chaithra ",
    "phone_number": "7795962016",
    "email": "shashiprabhaabeera@gmail.com",
    "": "",
    "city": " Bengaluru"
  },
  {
    "full_name": "Rounak Sastekar",
    "phone_number": "9164935513",
    "email": "rounaksastekar@gmail.com",
    "": "",
    "city": " Belagavi"
  },
  {
    "full_name": "Ramachandra K N",
    "phone_number": "9844769159",
    "email": "rram070003@gmail.com ",
    "": "",
    "city": " Bengaluru"
  },
  {
    "full_name": "Suraj Hanchate",
    "phone_number": "8867811866",
    "email": "rxsuri536@gmail.com",
    "": "",
    "city": "Bijapur talikoti"
  },
  {
    "full_name": "로기타",
    "phone_number": "9742545952",
    "email": " logithalogitha056@gmail.com",
    "": "",
    "city": "Bangalore"
  },
  {
    "full_name": "Prateeksha",
    "phone_number": "7483525608",
    "email": "prateeksharout771@gmail.com",
    "": "",
    "city": " Bangalore"
  }
]


console.log(kjkjk.length)

const leadQueues = {
  one: kjkjk, // First 10 leads for counselor 1
  // sid: kjkjk.slice(10) // Next 10 leads for counselor 2
};

export const startLeadCron = (queueName, counselorId) => {
  cron.schedule("*/70 * * * * *", async () => {

    const queue = leadQueues[queueName];

    if (!queue || queue.length === 0) {
      console.log(`⚠️ No leads left for ${queueName}`);
      return;
    }

    const nextLead = queue.shift();

    await insertSingleLead(nextLead, counselorId);

  });
};