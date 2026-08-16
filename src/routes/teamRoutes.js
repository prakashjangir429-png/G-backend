import express from "express";
import {
  upsertTeam,
  getTeams,
  getTeamById,
  addMember,
  removeMember,
  deleteTeam
} from "../controllers/teamController.js";

const router = express.Router();

router.post("/", upsertTeam);

router.get("/", getTeams);

router.get("/:id", getTeamById);

router.post("/add-member", addMember);

router.post("/remove-member", removeMember);

router.delete("/:id", deleteTeam);

export default router;