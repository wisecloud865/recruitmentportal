import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Accept"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
    recruitmentportal;
  }

  // Verify request method
  if (req.method !== "POST") {
    console.error("Invalid method:", req.method);
    return res
      .status(405)
      .json({ error: "Method not allowed", method: req.method });
  }

  try {
    // Log the raw request body for debugging
    console.log("Raw request body:", req.body);

    // Validate request body
    if (!req.body || typeof req.body !== "object") {
      throw new Error("Invalid request body");
    }

    const { companyIndex, candidateIndex, fieldKey, value } = req.body;

    // Validate required fields
    if (companyIndex === undefined || !fieldKey || value === undefined) {
      throw new Error("Missing required fields");
    }

    console.log("Processing request:", {
      companyIndex,
      candidateIndex,
      fieldKey,
      value,
    });

    // Initialize Octokit with GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Get current file content
    const { data: fileData } = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: "public/Companies_and_candidates.json",
    });

    // Parse the content
    const content = Buffer.from(fileData.content, "base64").toString();
    let data;
    try {
      data = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse JSON data");
    }

    // Update the data
    if (candidateIndex !== undefined) {
      if (!data[companyIndex]?.matched_candidates?.[candidateIndex]) {
        throw new Error("Candidate not found");
      }
      data[companyIndex].matched_candidates[candidateIndex][fieldKey] = value;
    } else {
      if (!data[companyIndex]) {
        throw new Error("Company not found");
      }
      data[companyIndex][fieldKey] = value;
    }

    // Update the file
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: "public/Companies_and_candidates.json",
      message: `Update ${fieldKey}`,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
      sha: fileData.sha,
    });

    // Send success response
    res.status(200).json({
      success: true,
      message: "Data updated successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
