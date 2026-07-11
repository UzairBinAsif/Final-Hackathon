import express from "express";
import {
  getIssues,
  getIssueById,
  assignIssue,
  updateIssueStatus,
} from "../controllers/issueController.js";
import { addMaintenanceRecord } from "../controllers/maintenanceController.js";
import {
  authenticateUser,
  requireRole,
} from "../middleware/authMiddleware.js";

const issueRoute = express.Router();

// All routes require authentication (admin/technician)
issueRoute.use(authenticateUser);

issueRoute.get("/", getIssues);
issueRoute.get("/:id", getIssueById);

// Update status & assign technician endpoints
issueRoute.put("/:id/assign", requireRole("admin"), assignIssue);
issueRoute.put("/:id/status", updateIssueStatus);

// Log maintenance record
issueRoute.post("/:id/maintenance", addMaintenanceRecord);

export default issueRoute;
