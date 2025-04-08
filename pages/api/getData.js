export default async function handler(req, res) {
  try {
    // Dynamically import Octokit
    const { Octokit } = await import("@octokit/rest");

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    console.log("Fetching data from GitHub...");

    const { data: file } = await octokit.repos.getContent({
      owner: "wisecloud865",
      repo: "recruitmentportal",
      path: "public/Companies_and_candidates.json",
    });

    const content = Buffer.from(file.content, "base64").toString();
    const data = JSON.parse(content);

    console.log("Data fetched successfully");

    // Set headers to prevent caching
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", {
      message: error.message,
      status: error.status,
      response: error.response?.data,
    });

    res.status(500).json({
      error: "Failed to fetch data",
      details: error.message,
    });
  }
}
