import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  try {
    const { companyId } = req.query;
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const { data: file } = await octokit.repos.getContent({
      owner: "wisecloud865",
      repo: "recruitmentportal",
      path: `public/candidates/company_${companyId}.json`,
    });

    const candidates = JSON.parse(
      Buffer.from(file.content, "base64").toString()
    );

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: error.message });
  }
}
