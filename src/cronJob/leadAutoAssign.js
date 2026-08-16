import cron from "node-cron";
import User from "../models/User.js";
import { Lead } from "../models/Leads.js";
import mongoose from "mongoose";
import { readAssignmentConfig, writeAssignmentConfig } from "../services/jsonFunction.js";
import { Leadlogs } from "../models/leadLogs.js";

const CRON_SCHEDULE = "*/60 * * * * *";
const TIMEZONE = "Asia/Kolkata";


// async function assignOldestLeadsOneToOne() {
//   const counselors = await User.find({ role: "counselor", isActive: true })
//     .select("_id")
//     .sort({ _id: 1 })
//     .lean();

//   if (!counselors.length) {
//     console.log("⚠️ No counselors found.");
//     return 0;
//   }


//   const leads = await Lead.find({
//     $or: [
//       { assignedCounselor: { $exists: false } },
//       { assignedCounselor: null }
//     ]
//   })
//     .sort({ createdAt: 1, _id: 1 })
//     .limit(counselors.length)
//     .lean();

//   console.log(leads)
//   if (!leads.length) {
//     return 0;
//   }
//   if (leads.length == 1) {
//     let lastAssigned = await Lead.findOne({ assignedCounselor: { $exists: true } }).sort({ createdAt: -1 });

//     const lastId = lastAssigned.assignedCounselor.toString();

//     const assignTo = counselors.find(
//       (c) => c._id.toString() != lastId
//     );

//     await Lead.updateOne(
//       { _id: leads[0]._id },
//       { $set: { assignedCounselor: assignTo._id } }
//     );
//     return 1;
//   } else {
//     const ops = leads.map((lead, i) => ({
//       updateOne: {
//         filter: { _id: lead._id },
//         update: {
//           $set: {
//             assignedCounselor: counselors[i]._id
//           }
//         }
//       }
//     }));

//     const result = await Lead.bulkWrite(ops);
//     return result.modifiedCount || ops.length;

//   }
// }

export async function assignOldestLeadsByForm() {

  const config = readAssignmentConfig();

  if (!config.length) {
    console.log("⚠️ No form assignment config found");
    return 0;
  }

  const leads = await Lead.find({
    $or: [
      { assignedCounselor: { $exists: false } },
      { assignedCounselor: null }
    ],
    "adsDetails.formId": { $exists: true, $ne: null }
  })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  console.log(leads.length)

  if (!leads.length) return 0;

  const ops = [];

  for (const lead of leads) {

    const formId = lead?.adsDetails?.formId;

    if (!formId) continue;

    const formConfig = config.find(c => c.formId === formId);

    if (!formConfig || !formConfig.counselors?.length) continue;

    const counselors = formConfig.counselors;

    // console.log("counsellors", counselors)

    let nextIndex = (formConfig.lastAssignedIndex + 1) % counselors.length;

    let counselorId = counselors[nextIndex];

    let isCounselorActive = await User.findOne({ _id: counselorId, isActive: true }).lean()

    if (!isCounselorActive) {
      nextIndex = (nextIndex + 1) % counselors.length;
      counselorId = counselors[nextIndex];
      isCounselorActive = await User.findOne({ _id: counselorId, isActive: true }).lean()
      if (!isCounselorActive) {
        continue
      }
    }

    ops.push({
      updateOne: {
        filter: { _id: lead._id },
        update: {
          $set: {
            assignedCounselor: new mongoose.Types.ObjectId(counselorId)
          }
        }
      }
    });

    const leadNamespace = global.io.of("/lead-notifications");
    leadNamespace
      .to(counselorId.toString())
      .emit("leadAssigned", {
        leadId: lead._id.toString(),
        name: lead.fullName || "Unknown",
        phone: lead.phone || "Unknown",
        message: `${lead.fullName} has been assigned to you`,
        createdAt: new Date()
      });

    const [counsellor, admins] = await Promise.all([User.findOne({ _id: counselorId, isActive: true }), User.find({ role: "admin", isActive: true })]);
    if (counsellor && counsellor.leader) {
      leadNamespace
        .to(counsellor.leader.toString())
        .emit("leadAssigned", {
          leadId: lead._id.toString(),
          name: lead.fullName || "Unknown",
          phone: lead.phone || "Unknown",
          message: `${lead.fullName} has been assigned to ${counsellor?.name}`,
          createdAt: new Date()
        });
    }
    admins.forEach((admin) => {
      leadNamespace
        .to(admin._id.toString())
        .emit("leadAssigned", {
          leadId: lead._id.toString(),
          name: lead.fullName || "Unknown",
          phone: lead.phone || "Unknown",
          message: `${lead.fullName} has been assigned to ${counsellor?.name}`,
          createdAt: new Date()
        });
    })

    formConfig.lastAssignedIndex = nextIndex;
  }

  if (!ops.length) return 0;

  const result = await Lead.bulkWrite(ops);

  writeAssignmentConfig(config);
  return result.modifiedCount || ops.length;
}

async function assignOldestLeadsOneToOne() {
  const counselors = await User.find({ role: "counselor", isActive: true })
    .select("_id")
    .sort({ _id: 1 })
    .lean();

  if (!counselors.length) {
    console.log("⚠️ No counselors found");
    return 0;
  }

  const leads = await Lead.find({
    $or: [
      { assignedCounselor: { $exists: false } },
      { assignedCounselor: null }
    ]
  })
    .sort({ createdAt: 1, _id: 1 })
    .limit(10)
    .lean();

  if (!leads.length) return 0;

  // find last assigned lead
  const lastAssignedLead = await Lead.findOne({
    assignedCounselor: { $exists: true, $ne: null }
  })
    .sort({ createdAt: -1 })
    .lean();

  let startIndex = 0;

  if (lastAssignedLead) {
    const lastIndex = counselors.findIndex(
      (c) => c._id.toString() === lastAssignedLead.assignedCounselor.toString()
    );

    if (lastIndex !== -1) {
      startIndex = (lastIndex + 1) % counselors.length;
    }
  }

  const ops = leads.map((lead, i) => {
    const counselor = counselors[(startIndex + i) % counselors.length];

    return {
      updateOne: {
        filter: { _id: lead._id },
        update: {
          $set: { assignedCounselor: counselor._id }
        }
      }
    };
  });

  const result = await Lead.bulkWrite(ops);

  return result.modifiedCount || ops.length;
}

cron.schedule(
  CRON_SCHEDULE,
  async () => {
    console.log("🔄 Auto-assign cron running:", new Date().toISOString());
    try {
      const assigned = await assignOldestLeadsByForm();
      console.log(`✅ Assigned ${assigned} leads this run`);
    } catch (err) {
      console.error("❌ Cron error:", err);
    }
  },
  { scheduled: true, timezone: TIMEZONE }
);

async function fixPhoneNumbersStartingWithP() {
  // find leads where phone starts with "p:"
  // const leads = await Lead.find({
  //   phone: { $regex: /^p:/i }
  // }).select("_id phone");

  const leads = await Lead.find({
    phone: { $exists: true, $ne: "" },
    $or: [
      { phone10: { $exists: false } },
      { phone10: null },
      { phone10: "" }
    ]
  })

  console.log(leads.length)

  if (!leads.length) {
    console.log("No phone numbers starting with p:");
    return 0;
  }


  const ops = leads.map((lead) => {
    const cleanedPhone = lead.phone.replace(/^p:/i, "");
    const phone10 = lead.phone.replace(/\D/g, "").slice(-10);

    return {
      updateOne: {
        filter: { _id: lead._id, phone10: { $exists: false } },
        update: {
          $set: { phone: cleanedPhone, phone10: phone10 }
        }
      }
    };
  });
  return 0

  const result = await Lead.bulkWrite(ops);

  console.log(`Updated ${result.modifiedCount} phone numbers`);
  return result.modifiedCount;
}

// fixPhoneNumbersStartingWithP()

const normalizePhone10 = (phone) => {
  if (!phone) return null;

  let p = String(phone).replace(/\D/g, "");
  return p.slice(-10);
};

export const assignExistingLeads = async (incomingLeads) => {

  const emails = incomingLeads
    .map(l => l.email?.toLowerCase()?.trim())
    .filter(Boolean);

  const phones = incomingLeads
    .map(l => normalizePhone10(l.phone_number))
    .filter(Boolean);

  const existingLeads = await Lead.find({
    $or: [
      // { email: { $in: emails } },
      { phone10: { $in: phones } }
    ]
  });

  const counselors = [
    "68fcaa8e2342af01fff255e5",
    "68fc9152992c137019ff739c"
  ];

  let index = 0;

  const updates = existingLeads.map(lead => {
    const counselor = counselors[index % 2];
    index++;

    return {
      updateOne: {
        filter: { _id: lead._id },
        update: {
          $set: {
            assignedCounselor: counselor,
            createdAt: new Date()
          }
        },
        timestamps: false
      }
    };
  });

  if (updates.length) {
    await Lead.bulkWrite(updates);
  }

  console.log({
    totalExisting: existingLeads.length,
    assigned: updates.length
  })
};

function getTop50Leads(leads) {
  return leads.slice(50);
}

// assignExistingLeads(NewLeads);


async function clearCallLogsByPhones(phones) {
  const phone10List = phones.map(p =>
    String(p.phone).replace(/\D/g, "").slice(-10)
  );

  const regexConditions = phone10List.map(num => ({
    phone: { $regex: `${num}$` } // match last 10 digits
  }));

  const result = await Leadlogs.deleteMany({
    $or: regexConditions
  });

  console.log(`Deleted ${result.deletedCount} call logs`);
  return result.deletedCount;
}

// clearCallLogsByPhones([
//   {
//     "name": "Dinesh S N",
//     "email": "dinesh.n7639@gmail.com",
//     "phone_number": "+916379173860"
//   },
//   {
//     "name": "Satish",
//     "email": "",
//     "phone_number": "+919566877020"
//   },
//   {
//     "name": "David",
//     "email": "",
//     "phone_number": "+918056105824"
//   },
//   {
//     "name": "Harni",
//     "email": "",
//     "phone_number": "+919626818515"
//   },
// ])



function parseDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr.replace(/\//g, "-"));
}

async function insertCallLogs(dataArray) {
  try {
    const logs = dataArray.map((item) => {
      const phone10 = String(item["Client Number"] || "")
        .replace(/\D/g, "")
        .slice(-10);


      let duration = 0;
      if (item["Duration (sec)"]) {
        duration = parseInt(item["Duration (sec)"].split("/")[0].trim()) || 0;
      }

      return {
        phone: phone10,
        masterCallNumber: item["Executive Number"] || "",
        callerId: item["Executive Number"] || "",
        duration,
        status: item["Call Status"] || "",
        ivrSTime: parseDate(item["Start Time"]),
        ivrETime: parseDate(
          item["End Time"] || item["Client Hangup Time"]
        ),
        recordingData: "https://api.dndfilter.com/api/final/ivr/call-recording/play/69b787d8db847b5a81abb88a",
        extraDetails: {
          Direction: item["Call Type"], cType: item["Call Type"] == "In" ? "IBD" : "CTC"
        }
      };
    });

    const result = await Leadlogs.insertMany(logs);

    console.log(`Inserted ${result.length} call logs`);
    return result.length;
  } catch (error) {
    console.error("Error inserting call logs:", error);
    throw error;
  }
}

// insertCallLogs()



export const runManualLeadAssignment = assignOldestLeadsOneToOne;