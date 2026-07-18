import Asset from "../models/AssetModel.js";
import User from "../models/UserModel.js";
import QRCode from "qrcode";
import { logAssetHistory } from "../helpers/historyHelper.js";
import AssetHistory from "../models/AssetHistoryModel.js";

// POST /api/assets
export const createAsset = async (req, res, next) => {
  try {
    const {
      name,
      assetCode,
      category,
      location,
      condition,
      status,
      assignedTechnician,
      lastServiceDate,
      nextServiceDate,
    } = req.body;

    // Basic Input Validation
    if (!name || !assetCode || !category || !location) {
      return res.status(400).json({
        status: false,
        message: "Name, assetCode, category, and location are required fields",
      });
    }

    const formattedAssetCode = assetCode.trim().toUpperCase();

    // Check if assetCode already exists
    const duplicateAsset = await Asset.findOne({ assetCode: formattedAssetCode });
    if (duplicateAsset) {
      return res.status(400).json({
        status: false,
        message: `Asset code '${formattedAssetCode}' is already in use`,
      });
    }

    // Validate assignedTechnician exists if provided
    let technicianId = assignedTechnician && assignedTechnician !== "" ? assignedTechnician : null;
    if (technicianId) {
      const technicianExists = await User.findById(technicianId);
      if (!technicianExists) {
        return res.status(400).json({
          status: false,
          message: "Assigned technician user not found",
        });
      }
    }

    const newAsset = new Asset({
      name,
      assetCode: formattedAssetCode,
      category,
      location,
      condition,
      status: status || "Operational",
      assignedTechnician: technicianId,
      lastServiceDate: lastServiceDate || null,
      nextServiceDate: nextServiceDate || null,
    });

    await newAsset.save();

    // Log in Asset History
    await logAssetHistory(newAsset._id, "Asset Created", req.user.id);

    return res.status(201).json({
      status: true,
      message: "Asset created successfully",
      asset: newAsset,
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

// GET /api/assets
export const getAssets = async (req, res, next) => {
  try {
    const { status, category, location, search } = req.query;

    const query = {};

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = location;
    }

    // Apply search query (matches name or assetCode case-insensitively)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { assetCode: { $regex: search, $options: "i" } },
      ];
    }

    const assets = await Asset.find(query)
      .populate("assignedTechnician", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      count: assets.length,
      assets,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/assets/:id
export const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findById(id).populate(
      "assignedTechnician",
      "name email role"
    );

    if (!asset) {
      return res.status(404).json({
        status: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      status: true,
      asset,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid asset ID format",
      });
    }
    next(error);
  }
};

// PUT /api/assets/:id
export const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Format assetCode if present in request body
    if (updateData.assetCode) {
      updateData.assetCode = updateData.assetCode.trim().toUpperCase();

      // Check unique constraint for assetCode
      const duplicateAsset = await Asset.findOne({
        assetCode: updateData.assetCode,
        _id: { $ne: id },
      });
      if (duplicateAsset) {
        return res.status(400).json({
          status: false,
          message: `Asset code '${updateData.assetCode}' is already in use by another asset`,
        });
      }
    }

    // Validate assignedTechnician exists if provided
    if (updateData.assignedTechnician) {
      const technicianExists = await User.findById(updateData.assignedTechnician);
      if (!technicianExists) {
        return res.status(400).json({
          status: false,
          message: "Assigned technician user not found",
        });
      }
    }

    const updatedAsset = await Asset.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("assignedTechnician", "name email role");

    if (!updatedAsset) {
      return res.status(404).json({
        status: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Asset updated successfully",
      asset: updatedAsset,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: error.message,
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid asset ID format",
      });
    }
    next(error);
  }
};

// DELETE /api/assets/:id
export const deleteAsset = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedAsset = await Asset.findByIdAndDelete(id);

    if (!deletedAsset) {
      return res.status(404).json({
        status: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: `Asset with code '${deletedAsset.assetCode}' deleted successfully`,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid asset ID format",
      });
    }
    next(error);
  }
};

// GET /api/assets/qr/:assetCode
export const getAssetQRCode = async (req, res, next) => {
  try {
    const { assetCode } = req.params;
    const formattedAssetCode = assetCode.trim().toUpperCase();

    // Find the asset first to verify it exists
    const asset = await Asset.findOne({ assetCode: formattedAssetCode });
    if (!asset) {
      return res.status(404).json({
        status: false,
        message: `Asset with code '${formattedAssetCode}' not found`,
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const publicUrl = `${frontendUrl}/asset/${asset.assetCode}`;

    const format = req.query.format;
    if (format === "base64") {
      const base64Str = await QRCode.toDataURL(publicUrl);
      return res.status(200).json({
        status: true,
        qrCode: base64Str,
      });
    } else {
      const qrBuffer = await QRCode.toBuffer(publicUrl, { type: "png" });
      res.setHeader("Content-Type", "image/png");
      return res.send(qrBuffer);
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/public/asset/:assetCode
export const getPublicAssetByCode = async (req, res, next) => {
  try {
    const { assetCode } = req.params;
    const formattedAssetCode = assetCode.trim().toUpperCase();

    const asset = await Asset.findOne({ assetCode: formattedAssetCode });
    if (!asset) {
      return res.status(404).json({
        status: false,
        message: `Asset with code '${formattedAssetCode}' not found`,
      });
    }

    // Only return safe fields
    const safeAsset = {
      name: asset.name,
      assetCode: asset.assetCode,
      category: asset.category,
      location: asset.location,
      condition: asset.condition,
      status: asset.status,
      lastServiceDate: asset.lastServiceDate,
      nextServiceDate: asset.nextServiceDate,
    };

    return res.status(200).json({
      status: true,
      asset: safeAsset,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/assets/:id/history (Protected)
export const getAssetHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assetExists = await Asset.findById(id);
    if (!assetExists) {
      return res.status(404).json({
        status: false,
        message: "Asset not found",
      });
    }

    const history = await AssetHistory.find({ asset: id })
      .populate("actor", "name email role")
      .populate("relatedIssue", "issueNumber title status")
      .sort({ timestamp: -1 });

    return res.status(200).json({
      status: true,
      count: history.length,
      history,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid asset ID format",
      });
    }
    next(error);
  }
};
