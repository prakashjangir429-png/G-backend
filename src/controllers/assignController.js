import LeadAssignmentConfig from "../models/leadAssignment.js";
import Team from "../models/teams.js";

export const upsertConfig = async (req, res) => {
  try {
    const {
      _id,
      formId,
      campaignId,
      teamId,
      isActive,
      assignmentType
    } = req.body;

    if (!formId) {
      return res.status(400).json({ message: "formId is required" });
    }

    if (!teamId) {
      return res.status(400).json({ message: "teamId is required" });
    }

    // validate team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(400).json({ message: "Invalid teamId" });
    }

    // prevent duplicate formId
    const exists = await LeadAssignmentConfig.findOne({
      formId,
      _id: { $ne: _id || null }
    });

    if (exists) {
      return res.status(400).json({ message: "Config already exists for this formId" });
    }

    const payload = {
      formId,
      teamId,
      ...(campaignId && { campaignId }),
      ...(isActive !== undefined && { isActive }),
      ...(assignmentType && { assignmentType })
    };

    let config;

    // UPDATE
    if (_id) {
      config = await LeadAssignmentConfig.findByIdAndUpdate(
        _id,
        { $set: payload },
        { new: true, runValidators: true }
      ).populate({
        path: "teamId",
        populate: {
          path: "members.user",
          select: "name email"
        }
      });

      if (!config) {
        return res.status(404).json({ message: "Config not found" });
      }

      return res.json({
        success: true,
        message: "Config updated",
        data: config
      });
    }

    // CREATE
    config = await LeadAssignmentConfig.create(payload);

    res.status(201).json({
      success: true,
      message: "Config created",
      data: config
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConfigs = async (req, res) => {
  try {
    const configs = await LeadAssignmentConfig.find()
      .populate({
        path: "teamId",
        populate: {
          path: "members.user",
          select: "name email role"
        }
      });

    res.json({
      success: true,
      count: configs.length,
      data: configs
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getConfigById = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await LeadAssignmentConfig.findById(id)
      .populate({
        path: "teamId",
        populate: {
          path: "members.user",
          select: "name email role"
        }
      });

    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await LeadAssignmentConfig.findByIdAndDelete(id);

    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }

    res.json({
      success: true,
      message: "Config deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await LeadAssignmentConfig.findById(id);

    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }

    config.isActive = !config.isActive;
    await config.save();

    res.json({
      success: true,
      message: `Config ${config.isActive ? "activated" : "deactivated"}`,
      data: config
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getByFormId = async (req, res) => {
  try {
    const { formId } = req.params;

    const config = await LeadAssignmentConfig.findOne({ formId })
      .populate({
        path: "teamId",
        populate: {
          path: "members.user",
          select: "name email"
        }
      });

    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};