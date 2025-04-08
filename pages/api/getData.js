import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Get the file content from GitHub
    const { data: file } = await octokit.repos.getContent({
      owner: "wisecloud865",
      repo: "recruitmentportal",
      path: "public/Companies_and_candidates.json",
    });

    // Decode and parse the content
    const content = Buffer.from(file.content, "base64").toString();
    const data = JSON.parse(content);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: error.message });
  }
}
