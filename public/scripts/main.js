document.addEventListener("DOMContentLoaded", async () => {
  try {
    const companiesSection = document.getElementById("companies");

    if (!companiesSection) {
      console.error("Companies section not found in the DOM");
      return;
    }

    // Update the fetch to use the API endpoint instead of static file
    const response = await fetch("/api/getData");

    if (!response.ok) {
      console.error("Failed to fetch:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data successfully loaded:", data);

    // Update the company container creation section in your main event listener
    data.forEach((company, index) => {
      const companyContainer = document.createElement("div");
      companyContainer.className = "company-container";

      // Create company title with indicators
      const companyTitle = document.createElement("div");
      companyTitle.innerHTML = createCompanyTitle(company);
      companyContainer.appendChild(companyTitle);

      // Company Table
      const companyTable = document.createElement("table");
      companyTable.className = "info-table";
      companyTable.appendChild(
        createTableHeader("Company Information", "Details")
      );
      const companyTbody = document.createElement("tbody");

      // Add all company fields to the table
      Object.entries(company).forEach(([key, value]) => {
        if (key !== "matched_candidates" && key !== "id") {
          const row = document.createElement("tr");
          row.className = "company-row";

          // Format the value based on field type
          let formattedValue = formatFieldValue(key, value);

          row.innerHTML = `
            <td class="info-label">${key.replace(/_/g, " ").toUpperCase()}</td>
            <td class="info-value">${formattedValue}</td>
          `;
          companyTbody.appendChild(row);
        }
      });

      companyTable.appendChild(companyTbody);
      companyContainer.appendChild(companyTable);

      // Add "View Matched Candidates" button
      if (company.matched_candidates && company.matched_candidates.length > 0) {
        const viewCandidatesBtn = document.createElement("button");
        viewCandidatesBtn.className = "view-candidates-btn";
        viewCandidatesBtn.innerHTML = `
          <i class="fas fa-users"></i> 
          View Matched Candidates (${company.matched_candidates.length})
        `;

        // Create candidates container (initially hidden)
        const candidatesContainer = document.createElement("div");
        candidatesContainer.className = "candidates-container hidden";

        viewCandidatesBtn.addEventListener("click", () => {
          const isHidden = candidatesContainer.classList.contains("hidden");

          // Toggle button text and icon
          viewCandidatesBtn.innerHTML = isHidden
            ? `<i class="fas fa-chevron-up"></i> Hide Candidates`
            : `<i class="fas fa-users"></i> View Matched Candidates (${company.matched_candidates.length})`;

          // Toggle candidates visibility
          candidatesContainer.classList.toggle("hidden");

          // Load candidates if not already loaded
          if (isHidden && candidatesContainer.children.length === 0) {
            loadCandidates(
              company.matched_candidates,
              candidatesContainer,
              index
            );
          }
        });

        companyContainer.appendChild(viewCandidatesBtn);
        companyContainer.appendChild(candidatesContainer);
      }

      companiesSection.appendChild(companyContainer);
    });
  } catch (error) {
    console.error("Error details:", error);
    document.getElementById(
      "companies"
    ).innerHTML = `<p class="error-message">Failed to load data: ${error.message}</p>`;
  }
});

// Helper functions
function createCompanyTitle(company) {
  const companyName = company.företagsnamn || "N/A";
  const companyTypeIndicators = createCompanyTypeIndicators(company);

  return `
        <h3 class="table-title1">
            <i class="fas fa-building"></i>
            ${companyName}
            <span class="company-type-indicators">
                ${companyTypeIndicators}
            </span>
        </h3>
    `;
}

function createCompanyTypeIndicators(company) {
  const isRecruitment = company.recruitmentcompany;
  const isConsultant = company.consultantcompany;
  let dots = "";

  if (isRecruitment) {
    dots += '<span class="legend-dot pink" title="Recruitment Company"></span>';
  }
  if (isConsultant) {
    dots += '<span class="legend-dot black" title="Consultant Company"></span>';
  }

  return dots;
}

function createEmailLink(email) {
  if (!email || email === "N/A") return "N/A";
  return `
        <a href="mailto:${email}" 
           class="link email-link" 
           title="Send email to ${email}">
            <i class="fas fa-envelope"></i> ${email}
        </a>`;
}

// Add this helper function for creating clickable web links
function createWebLink(url) {
  if (!url || url === "N/A" || url === "none") {
    return '<span class="empty-field">No website provided</span>';
  }

  // Ensure URL has http/https prefix
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;

  return `
        <a href="${fullUrl}" 
           class="link web-link" 
           target="_blank" 
           title="Visit website">
            <i class="fas fa-globe"></i> ${url}
        </a>`;
}

function createPhoneLink(phone) {
  if (!phone || phone === "N/A") return "N/A";
  const cleanPhone = phone.replace(/\D/g, "");
  return `
        <a href="tel:${cleanPhone}" 
           class="link phone-link" 
           title="Call this number">
            <i class="fas fa-phone"></i> ${phone}
        </a>`;
}

// Add this function to create table headers
function createTableHeader(header1, header2) {
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
        <th class="info-label">${header1}</th>
        <th class="info-value">${header2}</th>
    `;
  thead.appendChild(headerRow);
  return thead;
}

// Add this helper function to format field values
function formatFieldValue(key, value) {
  if (key.toLowerCase().includes("email")) {
    return createEmailLink(value);
  } else if (key.toLowerCase().includes("webb")) {
    return createWebLink(value);
  } else if (key.toLowerCase().includes("telefon")) {
    return createPhoneLink(value);
  } else if (typeof value === "object") {
    return JSON.stringify(value, null, 2).replace(/[{}"]/g, "");
  }
  return value || "N/A";
}

// Add this function to load candidates
function loadCandidates(candidates, container, companyIndex) {
  candidates.forEach((candidate, idx) => {
    const candidateCard = document.createElement("div");
    candidateCard.className = "candidate-card";

    candidateCard.innerHTML = `
      <div class="candidate-header">
        <h4><i class="fas fa-user"></i> ${candidate.full_name}</h4>
        ${createDeleteButton(idx)}
      </div>
      <div class="candidate-details">
        <p><strong>Experience:</strong> ${candidate.total_workexperience}</p>
        <p><strong>Tech Stack:</strong> ${candidate.techterms}</p>
        <p><strong>Expected Salary:</strong> ${createEditableSalaryField(
          candidate.expected_salary,
          `salary-${companyIndex}-${idx}`
        )}</p>
        <p><strong>Expected Cost:</strong> ${createEditableCostField(
          candidate.expected_cost,
          `cost-${companyIndex}-${idx}`
        )}</p>
      </div>
    `;

    container.appendChild(candidateCard);

    // Setup editors after the elements are added to DOM
    setTimeout(() => {
      setupSalaryEditor(
        document.getElementById(`salary-${companyIndex}-${idx}`),
        candidate.expected_salary,
        candidate,
        companyIndex,
        idx
      );
      setupCostEditor(
        document.getElementById(`cost-${companyIndex}-${idx}`),
        candidate.expected_cost,
        candidate,
        companyIndex,
        idx
      );
    }, 0);
  });
}

// Add this helper function for creating editable salary fields
function createEditableSalaryField(value, containerId) {
  return `
    <div id="${containerId}" class="editable-field">
      <div class="display-value">
        <span class="salary-value">${Number(value).toLocaleString()}</span>
        <button class="edit-btn" title="Edit salary">
          <i class="fas fa-edit"></i> Edit
        </button>
      </div>
      <div class="edit-form hidden">
        <input type="number" value="${value}" min="0" step="1000">
        <div class="button-group">
          <button class="save-btn" title="Save changes">
            <i class="fas fa-check"></i> Save
          </button>
          <button class="cancel-btn" title="Cancel">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    </div>
  `;
}

// Add this helper function for creating editable cost fields
function createEditableCostField(value, containerId) {
  return `
        <div id="${containerId}" class="editable-field">
            <div class="display-value">
                <span class="cost-value">${Number(
                  value
                ).toLocaleString()}</span>
                <button class="edit-btn" title="Edit cost">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
            <div class="edit-form hidden">
                <input type="number" value="${value}" min="0" step="1000">
                <div class="button-group">
                    <button class="save-btn" title="Save changes">
                        <i class="fas fa-check"></i> Save
                    </button>
                    <button class="cancel-btn" title="Cancel">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Add this function near your other helper functions
function createDeleteButton(candidateIndex) {
  return `
    <div class="delete-button-wrapper">
      <button class="delete-btn" title="Delete candidate">
        <i class="fas fa-trash"></i>
      </button>
      <div class="delete-confirmation-overlay hidden">
        <div class="delete-confirmation-dialog">
          <p>Are you sure you want to delete this candidate?</p>
          <div class="confirmation-buttons">
            <button class="confirm-delete btn-danger">
              <i class="fas fa-trash"></i> Yes, Delete
            </button>
            <button class="cancel-delete btn-secondary">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Add this helper function for notifications
function showNotification(message, isSuccess) {
  const notification = document.createElement("div");
  notification.className = `notification ${isSuccess ? "success" : "error"}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Keep only one copy of these utility functions
function setupSalaryEditor(
  container,
  originalValue,
  candidate,
  companyIndex,
  candidateIndex
) {
  const editBtn = container.querySelector(".edit-btn");
  const editForm = container.querySelector(".edit-form");
  const input = container.querySelector("input");
  const saveBtn = container.querySelector(".save-btn");
  const cancelBtn = container.querySelector(".cancel-btn");
  const displayValue = container.querySelector(".salary-value");

  editBtn.addEventListener("click", () => {
    editBtn.parentElement.classList.add("hidden");
    editForm.classList.remove("hidden");
    input.value = originalValue;
    input.focus();
  });

  saveBtn.addEventListener("click", async () => {
    const newValue = Number(input.value);
    if (isNaN(newValue) || newValue < 0) {
      alert("Please enter a valid salary amount");
      return;
    }

    try {
      console.log("Sending update request:", {
        companyIndex,
        candidateIndex,
        fieldKey: "expected_salary",
        value: newValue,
      });

      const response = await fetch("/api/updateData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyIndex,
          candidateIndex,
          fieldKey: "expected_salary",
          value: newValue,
        }),
      });

      const result = await response.json();
      console.log("Update response:", result);

      if (result.success) {
        displayValue.textContent = newValue.toLocaleString();
        editForm.classList.add("hidden");
        editBtn.parentElement.classList.remove("hidden");

        const successMsg = document.createElement("div");
        successMsg.className = "success-message";
        successMsg.textContent = "Salary updated successfully";
        container.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 2000);
      } else {
        throw new Error(result.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes: " + error.message);
    }
  });

  cancelBtn.addEventListener("click", () => {
    input.value = originalValue;
    editForm.classList.add("hidden");
    editBtn.parentElement.classList.remove("hidden");
  });
}

function setupCostEditor(
  container,
  originalValue,
  candidate,
  companyIndex,
  candidateIndex
) {
  const editBtn = container.querySelector(".edit-btn");
  const editForm = container.querySelector(".edit-form");
  const input = container.querySelector("input");
  const saveBtn = container.querySelector(".save-btn");
  const cancelBtn = container.querySelector(".cancel-btn");
  const displayValue = container.querySelector(".cost-value");

  editBtn.addEventListener("click", () => {
    editBtn.parentElement.classList.add("hidden");
    editForm.classList.remove("hidden");
    input.value = originalValue;
    input.focus();
  });

  saveBtn.addEventListener("click", async () => {
    const newValue = Number(input.value);
    if (isNaN(newValue) || newValue < 0) {
      alert("Please enter a valid cost amount");
      return;
    }

    try {
      const response = await fetch("/api/updateData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyIndex: companyIndex,
          candidateIndex: candidateIndex,
          fieldKey: "expected_cost",
          value: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      const result = await response.json();

      if (result.success) {
        displayValue.textContent = `${newValue.toLocaleString()}`;
        editForm.classList.add("hidden");
        editBtn.parentElement.classList.remove("hidden");

        const successMsg = document.createElement("div");
        successMsg.className = "success-message";
        successMsg.textContent = "Cost updated successfully";
        container.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 2000);
      } else {
        throw new Error(result.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes");
      input.value = originalValue;
      displayValue.textContent = `${originalValue.toLocaleString()}`;
    }
  });

  cancelBtn.addEventListener("click", () => {
    input.value = originalValue;
    editForm.classList.add("hidden");
    editBtn.parentElement.classList.remove("hidden");
  });
}
