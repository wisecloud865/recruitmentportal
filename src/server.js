const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Update middleware setup
app.use(cors());
app.use(express.json());
app.use("/", express.static(path.join(__dirname)));
app.use("/data", express.static(path.join(__dirname, "data")));

// Add this POST handler before the static middleware
app.post("/data/Companies_and_candidates.json", async (req, res) => {
  try {
    const { companyIndex, fieldKey, value } = req.body;
    console.log("Received update request:", { companyIndex, fieldKey, value });

    const data = await readData();

    if (!data[companyIndex]) {
      throw new Error("Company not found");
    }

    // Validate and update the value
    if (fieldKey.toLowerCase().includes("email")) {
      if (typeof value !== "string" || !value.includes("@")) {
        throw new Error("Invalid email format");
      }
    } else if (fieldKey.toLowerCase().includes("phone")) {
      if (typeof value !== "string" || value.trim() === "") {
        throw new Error("Invalid phone number");
      }
    }

    data[companyIndex][fieldKey] = value;
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
});

// Fix the file path function
function getDataFilePath() {
  return path.resolve(__dirname, "data/Companies_and_candidates.json");
}

// Read JSON data
async function readData() {
  const filePath = getDataFilePath();
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}

// Write JSON data
async function writeData(data) {
  const filePath = getDataFilePath();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Keep the updateField endpoint for salary and cost updates
app.post("/updateField", async (req, res) => {
  try {
    const { companyIndex, candidateIndex, fieldKey, value } = req.body;
    console.log("Update request received:", {
      companyIndex,
      candidateIndex,
      fieldKey,
      value,
    });

    const data = await readData();

    if (!data[companyIndex]) {
      throw new Error("Company not found");
    }

    if (["expected_salary", "expected_cost"].includes(fieldKey)) {
      if (!data[companyIndex].matched_candidates?.[candidateIndex]) {
        throw new Error("Candidate not found");
      }
      data[companyIndex].matched_candidates[candidateIndex][fieldKey] =
        Number(value);
    } else if (fieldKey.toLowerCase().includes("email")) {
      if (typeof value !== "string" || !value.includes("@")) {
        throw new Error("Invalid email format");
      }
      data[companyIndex][fieldKey] = value;
    } else if (
      fieldKey.toLowerCase().includes("phone") ||
      fieldKey.toLowerCase().includes("telefon")
    ) {
      if (typeof value !== "string" || value.trim() === "") {
        throw new Error("Invalid phone number");
      }
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
    res.status(error.message.includes("not found") ? 404 : 400).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete candidate endpoint
app.delete("/deleteCandidate", async (req, res) => {
  try {
    const { companyIndex, candidateIndex } = req.body;
    const data = await readData();

    if (!data[companyIndex]?.matched_candidates?.[candidateIndex]) {
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
    res.status(error.message.includes("not found") ? 404 : 400).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server with port handling
const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = app
      .listen(port, () => {
        console.log(`✅ Server running on http://localhost:${port}`);
        resolve(server);
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.log(`⚠️  Port ${port} is busy, trying ${port + 1}...`);
          resolve(startServer(port + 1));
        } else {
          reject(err);
        }
      });
  });
};

startServer(PORT).catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
