import Team from "../models/teams.js";

/**
 * CREATE / UPDATE TEAM (UPSERT using body)
 */
export const upsertTeam = async (req, res) => {
  try {
    const { _id, name, description, members, isActive, createdBy } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    // prevent duplicate name (for update also)
    const exists = await Team.findOne({
      name,
      _id: { $ne: _id || null }
    });

    if (exists) {
      return res.status(400).json({ message: "Team name already exists" });
    }

    const payload = {
      name,
      ...(description && { description }),
      ...(members && { members }),
      ...(isActive !== undefined && { isActive }),
      ...(createdBy && { createdBy })
    };

    let team;

    // UPDATE
    if (_id) {
      team = await Team.findByIdAndUpdate(
        _id,
        { $set: payload },
        { new: true, runValidators: true }
      ).populate("members.user", "name email role");

      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      return res.json({
        success: true,
        message: "Team updated",
        data: team
      });
    }

    // CREATE
    team = await Team.create(payload);

    res.status(201).json({
      success: true,
      message: "Team created",
      data: team
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * GET ALL TEAMS
 */
export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("members.user", "name email role")
      .populate("createdBy", "name email");

    res.json({
      success: true,
      count: teams.length,
      data: teams
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * GET SINGLE TEAM
 */
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id)
      .populate("members.user", "name email role")
      .populate("createdBy", "name email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({
      success: true,
      data: team
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * ADD MEMBER
 */
export const addMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // prevent duplicate
    const exists = team.members.some(
      m => m.user.toString() === userId
    );

    if (exists) {
      return res.status(400).json({ message: "User already in team" });
    }

    team.members.push({ user: userId });

    await team.save();

    res.json({
      success: true,
      message: "Member added"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * REMOVE MEMBER
 */
export const removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.members = team.members.filter(
      m => m.user.toString() !== userId
    );

    await team.save();

    res.json({
      success: true,
      message: "Member removed"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * DELETE TEAM
 */
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findByIdAndDelete(id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({
      success: true,
      message: "Team deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};