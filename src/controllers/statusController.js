import { Lead } from "../models/Leads.js";
import { LeadStatus } from "../models/leadStatus.js";


// ➤ Create Status
export const createLeadStatus = async (req, res) => {
  console.log(req.body)
  try {
    const { name, key } = req.body;

    const exists = await LeadStatus.findOne({ key });
    if (exists) {
      return res.status(400).json({ message: "Status key already exists" });
    }

    const status = await LeadStatus.create({
      name,
      key
    });

    res.status(201).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ➤ Get All Statuses
export const getLeadStatuses = async (req, res) => {
  const {isActive} = req.query
  try {
    const statuses = await LeadStatus.find({ isActive: isActive || true })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: statuses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ➤ Get Single Status
export const getLeadStatusById = async (req, res) => {
  try {
    const status = await LeadStatus.findById(req.params.id);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ➤ Update Status
export const updateLeadStatus = async (req, res) => {
  try {
    const { name, key, order, isActive } = req.body;

    const status = await LeadStatus.findById(req.params.id);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    if (key && key !== status.key) {
      const exists = await LeadStatus.findOne({ key });
      if (exists) {
        return res.status(400).json({ message: "Key already in use" });
      }
    }

    status.name = name ?? status.name;
    status.key = key ?? status.key;
    status.order = order ?? status.order;
    status.isActive = isActive ?? status.isActive;

    await status.save();

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ➤ Delete Status
export const deleteLeadStatus = async (req, res) => {
  try {
    const status = await LeadStatus.findById(req.params.id);


    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    const leads = await Lead.find({ status: status.key });

    if(leads.length > 0) {
      return res.status(400).json({ message: "Cannot delete status with leads" });
    }
    
    await status.deleteOne();

    res.status(200).json({
      success: true,
      message: "Status deleted"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ➤ Toggle Active/Inactive
export const toggleLeadStatus = async (req, res) => {
  try {
    const status = await LeadStatus.findById(req.params.id);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    status.isActive = !status.isActive;
    await status.save();

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ➤ Reorder Status (Drag & Drop Support)
export const reorderLeadStatus = async (req, res) => {
  try {
    const { statuses } = req.body;
    // [{ id, order }]

    const bulkOps = statuses.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { order: item.order }
      }
    }));

    await LeadStatus.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Order updated"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};