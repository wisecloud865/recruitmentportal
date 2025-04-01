const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Environment detection
const isProduction = process.env.NODE_ENV === "production";
const baseURL = isProduction
  ? "https://wisecloud.se/recruitmentportal/homepage-project-1"
  : `http://localhost:${PORT}`;

// CORS configuration
app.use(
  cors({
    origin: "https://wisecloud.se",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Static file serving
app.use(
  "/recruitmentportal/homepage-project-1",
  express.static(path.join(__dirname, ".."))
);
app.use(
  "/recruitmentportal/homepage-project-1/data",
  express.static(path.join(__dirname, "data"))
);

// Update file path function
function getDataFilePath() {
  return path.resolve(__dirname, "data/Companies_and_candidates.json");
}

// Read JSON data with better error handling
async function readData() {
  try {
    const filePath = getDataFilePath();
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading data file:", error);
    throw new Error("Failed to read data file");
  }
}

// Write JSON data
async function writeData(data) {
  const filePath = getDataFilePath();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
});

// Update endpoints to match the production URL structure
app.post(
  "/recruitmentportal/homepage-project-1/updateField",
  async (req, res) => {
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
  }
);

app.delete(
  "/recruitmentportal/homepage-project-1/deleteCandidate",
  async (req, res) => {
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
  }
);

// Start server with environment-aware logging
const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = app
      .listen(port, () => {
        console.log(`✅ Server running on ${baseURL}`);
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
