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

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { companyIndex, candidateIndex, fieldKey, value } = req.body;
    console.log("Received request:", {
      companyIndex,
      candidateIndex,
      fieldKey,
      value,
    });

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const { data: fileData } = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: "public/Companies_and_candidates.json",
    });

    const content = Buffer.from(fileData.content, "base64").toString();
    const data = JSON.parse(content);

    if (candidateIndex !== undefined) {
      data[companyIndex].matched_candidates[candidateIndex][fieldKey] = value;
    } else {
      data[companyIndex][fieldKey] = value;
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: "public/Companies_and_candidates.json",
      message: `Update ${fieldKey}`,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
      sha: fileData.sha,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
