import Issue from "../models/IssueModel.js";
import Asset from "../models/AssetModel.js";
import User from "../models/UserModel.js";
import { logAssetHistory } from "../helpers/historyHelper.js";

// POST /api/public/issues/:assetCode (Public)
export const reportIssue = async (req, res, next) => {
  try {
    const { assetCode } = req.params;
    const {
      title,
      description,
      category,
      priority,
      reporterName,
      reporterContact,
      aiSuggested,
    } = req.body;

    // Validate Input
    if (!title || !description || !category || !reporterName) {
      return res.status(400).json({
        status: false,
        message: "Title, description, category, and reporterName are required fields",
      });
    }

    const formattedAssetCode = assetCode.trim().toUpperCase();

    // Find corresponding Asset
    const asset = await Asset.findOne({ assetCode: formattedAssetCode });
    if (!asset) {
      return res.status(404).json({
        status: false,
        message: `Asset with code '${formattedAssetCode}' not found`,
      });
    }

    // Create the Issue
    const newIssue = new Issue({
      asset: asset._id,
      title,
      description,
      category,
      priority: priority || "Medium",
      status: "Reported",
      reporterName,
      reporterContact,
      aiSuggested: aiSuggested || false,
    });

    await newIssue.save();

    // Update Asset status to "Issue Reported"
    asset.status = "Issue Reported";
    await asset.save();

    // Log in Asset History
    await logAssetHistory(asset._id, "Issue Reported", null, newIssue._id);

    return res.status(201).json({
      status: true,
      message: "Issue reported successfully",
      issue: newIssue,
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

// GET /api/issues (Protected)
export const getIssues = async (req, res, next) => {
  try {
    const { status, priority, technician, assignedTechnician } = req.query;

    const query = {};

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    // Support technician search by ID using either query parameter name
    const techId = assignedTechnician || technician;
    if (techId) {
      query.assignedTechnician = techId;
    }

    const issues = await Issue.find(query)
      .populate("asset", "name assetCode category location status")
      .populate("assignedTechnician", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/issues/:id (Protected)
export const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id)
      .populate("asset", "name assetCode category location status")
      .populate("assignedTechnician", "name email role");

    if (!issue) {
      return res.status(404).json({
        status: false,
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      status: true,
      issue,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid issue ID format",
      });
    }
    next(error);
  }
};

// PUT /api/issues/:id/assign (Admin only)
export const assignIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTechnician } = req.body;

    if (!assignedTechnician) {
      return res.status(400).json({
        status: false,
        message: "assignedTechnician is a required field",
      });
    }

    // Check if technician exists
    const technician = await User.findById(assignedTechnician);
    if (!technician) {
      return res.status(400).json({
        status: false,
        message: "Assigned technician user not found",
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        status: false,
        message: "Issue not found",
      });
    }

    // A closed issue cannot be edited unless reopened first
    if (issue.status === "Closed") {
      return res.status(400).json({
        status: false,
        message: "Closed issue cannot be edited unless reopened first",
      });
    }

    issue.assignedTechnician = assignedTechnician;
    issue.status = "Assigned";
    await issue.save();

    // Log in Asset History
    if (issue.asset) {
      await logAssetHistory(issue.asset, "Status Changed: Assigned", req.user.id, issue._id);
    }

    const updatedIssue = await Issue.findById(id)
      .populate("asset", "name assetCode status")
      .populate("assignedTechnician", "name email role");

    return res.status(200).json({
      status: true,
      message: "Technician assigned successfully",
      issue: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/issues/:id/status
export const updateIssueStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, maintenanceNote, note } = req.body;

    if (!status) {
      return res.status(400).json({
        status: false,
        message: "status is a required field",
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        status: false,
        message: "Issue not found",
      });
    }

    // Enforce Authorization: Technician can only update if assigned to them; Admin can always update
    if (
      req.user.role === "technician" &&
      (!issue.assignedTechnician || issue.assignedTechnician.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        status: false,
        message: "Access denied. You can only update issues assigned to you",
      });
    }

    // State machine transition validation rules
    const validTransitions = {
      Reported: ["Assigned", "Inspection Started", "Closed"],
      Assigned: ["Inspection Started", "Maintenance In Progress", "Waiting for Parts", "Closed"],
      "Inspection Started": ["Maintenance In Progress", "Waiting for Parts", "Resolved", "Closed"],
      "Maintenance In Progress": ["Waiting for Parts", "Resolved", "Closed"],
      "Waiting for Parts": ["Maintenance In Progress", "Resolved", "Closed"],
      Resolved: ["Closed", "Reopened"],
      Closed: ["Reopened"],
      Reopened: ["Assigned", "Inspection Started", "Maintenance In Progress", "Waiting for Parts", "Closed"],
    };

    // A closed issue cannot be edited unless reopened first
    if (issue.status === "Closed" && status !== "Reopened") {
      return res.status(400).json({
        status: false,
        message: "Closed issue cannot be edited unless reopened first",
      });
    }

    // Enforce valid transitions only
    const allowedTransitions = validTransitions[issue.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Invalid status transition from '${issue.status}' to '${status}'`,
      });
    }

    // Require maintenance note before allowing status = Resolved
    const actualNote = maintenanceNote || note;
    if (status === "Resolved") {
      if (!actualNote || !actualNote.trim()) {
        return res.status(400).json({
          status: false,
          message: "A maintenance note is required to resolve this issue",
        });
      }
      issue.maintenanceNote = actualNote.trim();
    } else if (actualNote) {
      issue.maintenanceNote = actualNote.trim();
    }

    issue.status = status;
    await issue.save();

    // Log in Asset History
    if (issue.asset) {
      const historyAction = status === "Resolved" ? "Issue Resolved" : `Status Changed: ${status}`;
      await logAssetHistory(issue.asset, historyAction, req.user.id, issue._id);
    }

    // Side effect: update linked Asset's status based on mapping
    const assetStatusMap = {
      "Inspection Started": "Under Inspection",
      "Maintenance In Progress": "Under Maintenance",
      Resolved: "Operational",
    };

    if (assetStatusMap[status] && issue.asset) {
      await Asset.findByIdAndUpdate(issue.asset, { status: assetStatusMap[status] });
    }

    const updatedIssue = await Issue.findById(id)
      .populate("asset", "name assetCode status")
      .populate("assignedTechnician", "name email role");

    return res.status(200).json({
      status: true,
      message: `Issue status updated to '${status}' successfully`,
      issue: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};
