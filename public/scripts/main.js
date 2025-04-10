document.addEventListener("DOMContentLoaded", async () => {
  try {
    const companiesSection = document.getElementById("companies");
    if (!companiesSection) {
      throw new Error("Companies section not found!");
    }

    // Fetch companies data
    const companiesResponse = await fetch("/public/companies.json");
    if (!companiesResponse.ok) {
      throw new Error(`HTTP error! status: ${companiesResponse.status}`);
    }

    const companies = await companiesResponse.json();
    console.log("Companies data loaded:", companies);

    // Create containers for each company
    companies.forEach((company, index) => {
      const companyContainer = document.createElement("div");
      companyContainer.className = "company-container";

      // Create company info table
      const companyTable = document.createElement("table");
      companyTable.className = "info-table";

      // Add header
      const tableHeader = document.createElement("thead");
      tableHeader.innerHTML = `
        <tr>
          <th class="info-label">Field</th>
          <th class="info-value">Value</th>
        </tr>
      `;
      companyTable.appendChild(tableHeader);

      // Add company info rows
      const tbody = document.createElement("tbody");
      Object.entries(company).forEach(([key, value]) => {
        if (key !== "id") {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td class="info-label">${key}</td>
            <td class="info-value">${formatValue(value)}</td>
          `;
          tbody.appendChild(row);
        }
      });
      companyTable.appendChild(tbody);
      companyContainer.appendChild(companyTable);

      // Add "View Candidates" button
      const viewCandidatesBtn = document.createElement("button");
      viewCandidatesBtn.className = "view-candidates-btn";
      viewCandidatesBtn.innerHTML = `
        <i class="fas fa-users"></i> View Matched Candidates
      `;

      // Handle view candidates click
      viewCandidatesBtn.addEventListener("click", async () => {
        try {
          const candidatesResponse = await fetch(
            `/public/candidates/company_${company.id}.json`
          );
          if (!candidatesResponse.ok) {
            throw new Error("No candidates found");
          }

          const candidates = await candidatesResponse.json();

          // Create modal for candidates
          const modal = document.createElement("div");
          modal.className = "candidates-modal";
          modal.innerHTML = `
            <div class="candidates-modal-content">
              <div class="candidates-modal-header">
                <h3>Matched Candidates for ${company.företagsnamn}</h3>
                <button class="close-modal-btn">&times;</button>
              </div>
              <div class="candidates-grid">
                ${candidates
                  .map(
                    (candidate) => `
                  <div class="candidate-card">
                    <div class="candidate-header">
                      <h4>${candidate.full_name}</h4>
                    </div>
                    <div class="candidate-info">
                      <p><strong>Experience:</strong> ${candidate.total_workexperience}</p>
                      <p><strong>Tech Stack:</strong> ${candidate.techterms}</p>
                      <p><strong>Expected Salary:</strong> ${candidate.expected_salary}</p>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `;

          document.body.appendChild(modal);

          // Handle modal close
          const closeBtn = modal.querySelector(".close-modal-btn");
          closeBtn.addEventListener("click", () => modal.remove());
          modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.remove();
          });
        } catch (error) {
          console.error("Error loading candidates:", error);
          showNotification("No candidates found for this company", false);
        }
      });

      companyContainer.appendChild(viewCandidatesBtn);
      companiesSection.appendChild(companyContainer);
    });
  } catch (error) {
    console.error("Error details:", error);
    document.getElementById(
      "companies"
    ).innerHTML = `<p class="error-message">Failed to load data: ${error.message}</p>`;
  }
});

// Helper function to format values
function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  } else if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  }
  return value || "N/A";
}

// Notification helper
function showNotification(message, isSuccess) {
  const notification = document.createElement("div");
  notification.className = `notification ${isSuccess ? "success" : "error"}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}
