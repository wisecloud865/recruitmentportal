const fs = require("fs").promises;
const path = require("path");

module.exports = async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { companyIndex, candidateIndex } = req.body;
    console.log("Received delete request:", { companyIndex, candidateIndex });

    const data = await readData();

    if (!data[companyIndex]?.matched_candidates) {
      throw new Error("Candidate not found");
    }

    if (!data[companyIndex].matched_candidates[candidateIndex]) {
      throw new Error("Candidate not found");
    }

    data[companyIndex].matched_candidates.splice(candidateIndex, 1);
    await writeData(data);

    res.json({
      success: true,
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper functions
async function readData() {
  const filePath = path.join(
    process.cwd(),
    "public/Companies_and_candidates.json"
  );
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}

async function writeData(data) {
  const filePath = path.join(
    process.cwd(),
    "public/Companies_and_candidates.json"
  );
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
