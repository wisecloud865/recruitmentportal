import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const { data: file } = await octokit.repos.getContent({
      owner: "wisecloud865",
      repo: "recruitmentportal",
      path: "public/companies.json",
    });

    const companies = JSON.parse(
      Buffer.from(file.content, "base64").toString()
    );

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: error.message });
  }
}
