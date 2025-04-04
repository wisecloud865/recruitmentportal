const fs = require("fs").promises;
const path = require("path");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { companyIndex, candidateIndex, fieldKey, value } = req.body;
    console.log("Received update request:", {
      companyIndex,
      candidateIndex,
      fieldKey,
      value,
    });

    const data = await readData();

    if (!data[companyIndex]) {
      throw new Error("Company not found");
    }

    if (
      candidateIndex !== undefined &&
      data[companyIndex].matched_candidates &&
      data[companyIndex].matched_candidates[candidateIndex]
    ) {
      // Update candidate-level field
      data[companyIndex].matched_candidates[candidateIndex][fieldKey] = value;
    } else {
      // Update company-level field
      data[companyIndex][fieldKey] = value;
    }

    await writeData(data);

    res.json({
      success: true,
      message: `${fieldKey} updated successfully`,
      updatedValue: value,
    });
  } catch (error) {
    console.error("Update error:", error);
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
