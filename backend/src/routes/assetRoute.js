import express from "express";
import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetQRCode,
  getAssetHistory,
} from "../controllers/assetController.js";
import {
  authenticateUser,
  requireRole,
} from "../middleware/authMiddleware.js";

const assetRoute = express.Router();

// All routes require authentication
assetRoute.use(authenticateUser);

// List assets, get details, and retrieve QR codes
assetRoute.get("/", getAssets);
assetRoute.get("/qr/:assetCode", getAssetQRCode);
assetRoute.get("/:id", getAssetById);
assetRoute.get("/:id/history", getAssetHistory);

// Create, update, and delete assets (restricted to admin only)
assetRoute.post("/", requireRole("admin"), createAsset);
assetRoute.put("/:id", requireRole("admin"), updateAsset);
assetRoute.delete("/:id", requireRole("admin"), deleteAsset);

export default assetRoute;
