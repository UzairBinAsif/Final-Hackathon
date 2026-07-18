import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    issueNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assets",
      required: [true, "Asset reference is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High", "Critical"],
        message: "{VALUE} is not a valid priority",
      },
      default: "Medium",
    },
    status: {
      type: String,
      enum: {
        values: [
          "Reported",
          "Assigned",
          "Inspection Started",
          "Maintenance In Progress",
          "Waiting for Parts",
          "Resolved",
          "Closed",
          "Reopened",
        ],
        message: "{VALUE} is not a valid issue status",
      },
      default: "Reported",
    },
    reporterName: {
      type: String,
      required: [true, "Reporter name is required"],
      trim: true,
    },
    reporterEmail: {
      type: String,
      required: [true, "Reporter email is required"],
      trim: true,
      lowercase: true,
    },
    reporterContact: {
      type: String,
      trim: true,
    },
    aiSuggested: {
      type: Boolean,
      default: false,
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    maintenanceNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-generate issueNumber (e.g. ISSUE-1001)
issueSchema.pre("save", async function () {
  if (!this.issueNumber) {
    try {
      const IssueModel = mongoose.model("issues", issueSchema);
      const lastIssue = await IssueModel.findOne({}, {}, { sort: { createdAt: -1 } });
      
      let nextNum = 1001;
      if (lastIssue && lastIssue.issueNumber) {
        const match = lastIssue.issueNumber.match(/\d+/);
        if (match) {
          nextNum = parseInt(match[0]) + 1;
        }
      }
      this.issueNumber = `ISSUE-${nextNum}`;
    } catch (error) {
      throw error;
    }
  }
});

const Issue = mongoose.model("issues", issueSchema);
export default Issue;
