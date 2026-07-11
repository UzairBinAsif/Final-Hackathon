import MaintenanceRecord from "../models/MaintenanceRecordModel.js";
import Issue from "../models/IssueModel.js";
import { logAssetHistory } from "../helpers/historyHelper.js";

// POST /api/issues/:id/maintenance (Protected)
export const addMaintenanceRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, partsUsed, cost, timeTaken, evidenceUrls } = req.body;

    if (!notes || !notes.trim()) {
      return res.status(400).json({
        status: false,
        message: "Maintenance notes are required",
      });
    }

    if (cost !== undefined && cost < 0) {
      return res.status(400).json({
        status: false,
        message: "Cost cannot be negative",
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        status: false,
        message: "Issue not found",
      });
    }

    // Enforce permissions: technician can only add if assigned to them; admin can always add
    if (
      req.user.role === "technician" &&
      (!issue.assignedTechnician || issue.assignedTechnician.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        status: false,
        message: "Access denied. You can only log maintenance records for issues assigned to you",
      });
    }

    const newRecord = new MaintenanceRecord({
      issue: issue._id,
      technician: req.user.id,
      notes: notes.trim(),
      partsUsed: partsUsed || [],
      cost: cost || 0,
      timeTaken,
      evidenceUrls: evidenceUrls || [],
    });

    await newRecord.save();

    // Log in Asset History
    if (issue.asset) {
      await logAssetHistory(
        issue.asset,
        "Maintenance Added",
        req.user.id,
        issue._id
      );
    }

    return res.status(201).json({
      status: true,
      message: "Maintenance record added successfully",
      record: newRecord,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: error.message,
      });
    }
    next(error);
  }
};
