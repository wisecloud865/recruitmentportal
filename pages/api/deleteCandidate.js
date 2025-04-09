export default async function handler(req, res) {
  try {
    // Dynamically import Octokit
    const { Octokit } = await import("@octokit/rest");

    if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { companyIndex, candidateIndex } = req.body;

    if (companyIndex === undefined || candidateIndex === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Get the current file content
    const { data: file } = await octokit.repos.getContent({
      owner: "wisecloud865",
      repo: "recruitmentportal",
      path: "public/Companies_and_candidates.json",
    });

    // Decode and parse the content
    const content = Buffer.from(file.content, "base64").toString();
    const data = JSON.parse(content);

    // Validate indices
    if (!data[companyIndex]?.matched_candidates?.[candidateIndex]) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Remove the candidate
    data[companyIndex].matched_candidates.splice(candidateIndex, 1);

    // Update the file
    await octokit.repos.createOrUpdateFileContents({
      owner: "wisecloud865",
      repo: "recruitmentportal",
      path: "public/Companies_and_candidates.json",
      message: `Delete candidate at company ${companyIndex}, candidate ${candidateIndex}`,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
      sha: file.sha,
    });

    res
      .status(200)
      .json({ success: true, message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
