// POST /api/ai/triage
export const triageIssue = async (req, res, next) => {
  const { assetType, assetCategory, complaintText } = req.body;

  // Basic Validation
  if (!complaintText) {
    return res.status(400).json({
      status: false,
      message: "complaintText is a required field",
    });
  }

  // Graceful Fallback Helper
  const getFallbackTriage = () => {
    const formattedCategory = assetCategory || "General Maintenance";
    const formattedType = assetType || "Asset";
    return {
      title: `Potential issue with ${formattedType}`,
      category: formattedCategory,
      priority: "Medium",
      possibleCauses: [
        "Mechanical wear and tear over time",
        "Power supply interruption or electrical variance",
        "Sensors requiring recalibration or cleaning",
      ],
      initialChecks: [
        "Visually inspect the equipment for external damage, leaks, or obstruction",
        "Check if the main power switch is properly turned on and plugged in",
        "Look for any visible status indicator lights or displayed error codes",
      ],
      recurringWarning:
        "SAFETY FIRST: Do not attempt to bypass safety locks, open high-voltage panels, or perform complex mechanical work. Please consult a qualified technician for critical or hazardous issues.",
    };
  };

  const apiKey = process.env.OPENAI_API_KEY;

  // Check if API key is configured or is dummy/placeholder
  if (!apiKey || apiKey === "mock_openai_api_key_for_testing" || apiKey.includes("your_openai_api_key")) {
    console.log("OpenAI API Key is missing or mocked. Using graceful fallback triage.");
    return res.status(200).json({
      status: true,
      source: "fallback",
      triage: getFallbackTriage(),
    });
  }

  try {
    const prompt = `
You are an expert industrial maintenance triage system for the app MaintainIQ.
Analyze this maintenance complaint:
Asset Type: ${assetType || "Unknown"}
Asset Category: ${assetCategory || "Unknown"}
Complaint Description: "${complaintText}"

Based on the information, diagnose the issue and return a JSON object with the following fields:
- "title": A short, clear descriptive title for the reported issue.
- "category": The suggested category for this maintenance task.
- "priority": Suggest a priority level. MUST be exactly one of: "Low", "Medium", "High", "Critical".
- "possibleCauses": An array of strings containing 2 to 4 potential reasons for this issue.
- "initialChecks": An array of 2 to 4 safe, basic visual inspection steps that a general staff member can perform without tools.
- "recurringWarning": A safety warning string. 

SAFETY DIRECTIVE:
Under no circumstances suggest actions that involve electrical hazard, dismantling high-voltage equipment, tampering with wiring, bypassing safety interlocks, or dangerous mechanical disassembly. Always recommend hiring a qualified professional technician if there is high risk. The "recurringWarning" field must highlight this safety note.

Format the response strictly as a JSON object matching this schema. Do not include markdown codeblocks or extra conversational text outside of the JSON object.
`;

    // Make native fetch call to OpenAI Chat Completion API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // fallback to other models if needed, gpt-4o-mini is efficient and fast
        messages: [
          {
            role: "system",
            content: "You are a helpful industrial maintenance assistant that responds strictly in JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.warn(`OpenAI API returned error status: ${response.status}. Falling back.`);
      return res.status(200).json({
        status: true,
        source: "fallback",
        triage: getFallbackTriage(),
      });
    }

    const data = await response.json();
    const messageContent = data.choices[0].message.content;

    // Parse the JSON
    const parsedTriage = JSON.parse(messageContent);

    // Validate fields exist
    if (
      !parsedTriage.title ||
      !parsedTriage.category ||
      !parsedTriage.priority ||
      !Array.isArray(parsedTriage.possibleCauses) ||
      !Array.isArray(parsedTriage.initialChecks)
    ) {
      console.warn("AI response missing required JSON fields. Falling back.");
      return res.status(200).json({
        status: true,
        source: "fallback",
        triage: getFallbackTriage(),
      });
    }

    return res.status(200).json({
      status: true,
      source: "ai",
      triage: parsedTriage,
    });
  } catch (error) {
    console.error("Error calling OpenAI or parsing response:", error);
    // Graceful response, no crash
    return res.status(200).json({
      status: true,
      source: "fallback",
      triage: getFallbackTriage(),
    });
  }
};
