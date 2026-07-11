import express from "express";
import { getPublicAssetByCode } from "../controllers/assetController.js";
import { reportIssue } from "../controllers/issueController.js";

const publicRoute = express.Router();

// Public route to view asset details by code (unauthenticated)
publicRoute.get("/asset/:assetCode", getPublicAssetByCode);

// Public route to report an issue against an asset (unauthenticated)
publicRoute.post("/issues/:assetCode", reportIssue);

export default publicRoute;
