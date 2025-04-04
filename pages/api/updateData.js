import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { companyIndex, candidateIndex, fieldKey, value } = req.body;

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const { data: fileData } = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: process.env.GITHUB_FILE_PATH,
    });

    const content = Buffer.from(fileData.content, "base64").toString("utf-8");
    const data = JSON.parse(content);

    if (!data[companyIndex]) {
      throw new Error("Company not found");
    }

    if (
      candidateIndex !== undefined &&
      data[companyIndex].matched_candidates &&
      data[companyIndex].matched_candidates[candidateIndex]
    ) {
      data[companyIndex].matched_candidates[candidateIndex][fieldKey] = value;
    } else {
      data[companyIndex][fieldKey] = value;
    }

    const updatedContent = JSON.stringify(data, null, 2);
    const updatedContentBase64 = Buffer.from(updatedContent).toString("base64");

    await octokit.repos.updateFile({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: process.env.GITHUB_FILE_PATH,
      message: `Update ${fieldKey} in ${process.env.GITHUB_FILE_PATH}`,
      content: updatedContentBase64,
      sha: fileData.sha,
    });

    res
      .status(200)
      .json({ success: true, message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
