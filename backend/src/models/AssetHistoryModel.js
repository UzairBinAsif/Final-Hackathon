import mongoose from "mongoose";

const assetHistorySchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "assets",
    required: [true, "Asset reference is required"],
  },
  action: {
    type: String,
    required: [true, "Action description is required"],
    trim: true,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: false, // Optional for public actions like unauthenticated issue report
  },
  relatedIssue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "issues",
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const AssetHistory = mongoose.model("asset_histories", assetHistorySchema);
export default AssetHistory;
