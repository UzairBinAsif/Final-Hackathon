import AssetHistory from "../models/AssetHistoryModel.js";

/**
 * Standard helper to log Asset History events.
 * Crucially, we wrap it in try/catch to avoid breaking the primary request thread.
 * 
 * @param {string} assetId - The MongoDB ID of the asset.
 * @param {string} action - The action description (e.g. "Asset Created", "Issue Reported", "Status Changed: Assigned").
 * @param {string|null} actorId - The MongoDB ID of the user triggering the action (optional).
 * @param {string|null} relatedIssueId - The MongoDB ID of the related issue (optional).
 */
export const logAssetHistory = async (assetId, action, actorId = null, relatedIssueId = null) => {
  try {
    const history = new AssetHistory({
      asset: assetId,
      action,
      actor: actorId || undefined,
      relatedIssue: relatedIssueId || undefined,
    });
    await history.save();
    return history;
  } catch (error) {
    console.error("Failed to log asset history:", error);
  }
};
