export default async function handler(req, res) {
  // Dynamically import Octokit
  const { Octokit } = await import("@octokit/rest");

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

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Validate GitHub configuration
    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GitHub token is not configured");
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Validate request
    const { companyIndex, candidateIndex, fieldKey, value } = req.body;
    if (companyIndex === undefined || !fieldKey || value === undefined) {
      throw new Error("Missing required fields");
    }

    // Get the file content
    const { data: file } = await octokit.repos.getContent({
      owner: "wisecloud865",
      repo: "recruitmentportal",
      path: "public/Companies_and_candidates.json",
    });

    // Decode and parse the content
    const content = Buffer.from(file.content, "base64").toString();
    const data = JSON.parse(content);

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
      owner: "wisecloud865",
      repo: "recruitmentportal",
      path: "public/Companies_and_candidates.json",
      message: `Update ${fieldKey} for company ${companyIndex}`,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
      sha: file.sha,
    });

    res.status(200).json({
      success: true,
      message: "Data updated successfully",
    });
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      response: error.response?.data,
    });

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
