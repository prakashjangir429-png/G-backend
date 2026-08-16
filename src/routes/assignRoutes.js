import express from "express";
import {
  upsertConfig,
  getConfigs,
  getConfigById,
  deleteConfig,
  toggleActive,
  getByFormId
} from "../controllers/assignController.js";

const router = express.Router();

router.post("/", upsertConfig);

router.get("/", getConfigs);

router.get("/form/:formId", getByFormId);

router.get("/:id", getConfigById);

router.patch("/toggle/:id", toggleActive);

router.delete("/:id", deleteConfig);

export default router;