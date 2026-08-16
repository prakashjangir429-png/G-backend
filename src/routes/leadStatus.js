import express from "express";
import {
  createLeadStatus,
  getLeadStatuses,
  getLeadStatusById,
  updateLeadStatus,
  deleteLeadStatus,
  toggleLeadStatus,
  reorderLeadStatus
} from "../controllers/statusController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createLeadStatus);
router.get("/", getLeadStatuses);
router.get("/:id", getLeadStatusById);
router.put("/:id", updateLeadStatus);
router.delete("/:id", deleteLeadStatus);

router.patch("/:id/toggle", toggleLeadStatus);

export default router;