import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
    },
    assetCode: {
      type: String,
      required: [true, "Asset code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    condition: {
      type: String,
      trim: true,
      default: "Good",
    },
    status: {
      type: String,
      enum: {
        values: [
          "Operational",
          "Issue Reported",
          "Under Inspection",
          "Under Maintenance",
          "Out of Service",
          "Retired",
        ],
        message: "{VALUE} is not a valid asset status",
      },
      default: "Operational",
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    lastServiceDate: {
      type: Date,
    },
    nextServiceDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Asset = mongoose.model("assets", assetSchema);
export default Asset;
