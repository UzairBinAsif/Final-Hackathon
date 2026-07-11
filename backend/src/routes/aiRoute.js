import express from "express";
import { triageIssue } from "../controllers/aiController.js";

const aiRoute = express.Router();

// Triage issue using AI (or graceful fallback if unavailable/unconfigured)
aiRoute.post("/triage", triageIssue);

export default aiRoute;
