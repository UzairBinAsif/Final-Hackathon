import mongoose from "mongoose";

const maintenanceRecordSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "issues",
      required: [true, "Issue reference is required"],
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Technician reference is required"],
    },
    notes: {
      type: String,
      required: [true, "Maintenance notes are required"],
      trim: true,
    },
    partsUsed: {
      type: [String],
      default: [],
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
      default: 0,
    },
    timeTaken: {
      type: String,
      trim: true,
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const MaintenanceRecord = mongoose.model(
  "maintenance_records",
  maintenanceRecordSchema
);
export default MaintenanceRecord;
