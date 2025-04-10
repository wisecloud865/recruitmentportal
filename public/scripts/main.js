document.addEventListener("DOMContentLoaded", async () => {
  try {
    const companiesSection = document.getElementById("companies");

    if (!companiesSection) {
      console.error("Companies section not found in the DOM");
      return;
    }

    // First, fetch the metadata to get pagination info
    const metadataResponse = await fetch("/api/getMetadata");
    if (!metadataResponse.ok) {
      throw new Error(`HTTP error! status: ${metadataResponse.status}`);
    }
    const metadata = await metadataResponse.json();

    // Fetch first page of companies
    const companiesResponse = await fetch("/api/getCompanies?page=1");
    if (!companiesResponse.ok) {
      throw new Error(`HTTP error! status: ${companiesResponse.status}`);
    }
    const companiesData = await companiesResponse.json();

    // Process each company
    companiesData.companies.forEach((company, index) => {
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

      // Define default company fields
      const defaultCompanyFields = [
        { label: "Titel", key: "titel" },
        { label: "Företagswebb", key: "företagswebb" },
        { label: "Kontakt Email 1", key: "kontakt_email1" },
        { label: "Kontakt Email 2", key: "kontakt_email2" },
        { label: "Kontakt Person 1", key: "kontaktperson1" },
        { label: "Kontakt Telefon", key: "kontakt_telefon1" },
      ];

      // Add company information rows
      defaultCompanyFields.forEach((field) => {
        const row = document.createElement("tr");
        row.className = "company-row";
        let value = company[field.key] || "N/A";

        if (field.key.toLowerCase().includes("webb")) {
          row.innerHTML = `
                        <td class="info-label">${field.label}</td>
                        <td class="info-value">
                            ${createWebLink(value)}
                        </td>
                    `;
        } else if (field.key.toLowerCase().includes("email")) {
          const containerId = `email-${field.key}-${index}`;
          row.innerHTML = `
            <td class="info-label">${field.label}</td>
            <td class="info-value">${createEditableEmailField(
              value,
              containerId
            )}</td>
          `;

          setTimeout(() => {
            const container = document.getElementById(containerId);
            if (container) {
              setupEditableField(
                container,
                value,
                field.key,
                "email",
                company,
                index
              );
            }
          }, 0);
        } else if (field.key.toLowerCase().includes("telefon")) {
          const containerId = `phone-${field.key}-${index}`;
          row.innerHTML = `
            <td class="info-label">${field.label}</td>
            <td class="info-value">${createEditablePhoneField(
              value,
              containerId
            )}</td>
          `;

          setTimeout(() => {
            const container = document.getElementById(containerId);
            if (container) {
              setupEditableField(
                container,
                value,
                field.key,
                "phone",
                company,
                index
              );
            }
          }, 0);
        } else {
          // Handle other fields normally
          row.innerHTML = `
                        <td class="info-label">${field.label}</td>
                        <td class="info-value">${value}</td>
                    `;
        }

        companyTbody.appendChild(row);
      });

      // Add other company information as hidden rows
      Object.entries(company).forEach(([key, value]) => {
        if (
          !defaultCompanyFields.some((field) => field.key === key) &&
          key !== "matched_candidates"
        ) {
          const row = document.createElement("tr");
          row.className = "company-hidden";
          row.innerHTML = `
                        <td class="info-label">${key
                          .replace(/_/g, " ")
                          .toUpperCase()}</td>
                        <td class="info-value">${value || "N/A"}</td>
                    `;
          companyTbody.appendChild(row);
        }
      });

      companyTable.appendChild(companyTbody);
      companyContainer.appendChild(companyTable);

      // Add company dropdown button
      const companyDropdownBtn = document.createElement("button");
      companyDropdownBtn.className = "dropdown-btn company-dropdown-btn";
      companyDropdownBtn.innerHTML =
        'Show More Company Info <i class="fas fa-caret-down"></i>';
      companyContainer.appendChild(companyDropdownBtn);

      // Setup company dropdown functionality
      handleCompanyDropdown(companyContainer, companyTable, companyDropdownBtn);

      companiesSection.appendChild(companyContainer);

      // Add email button and confirmation dialog
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "action-buttons";
      buttonsContainer.innerHTML = `
        <button class="send-email-btn">
            <i class="fas fa-envelope"></i> Send Email
        </button>
        <div class="confirmation-dialog hidden">
            <p>Are you sure you want to send an email?</p>
            <div class="confirmation-buttons">
                <button class="confirm-btn">Yes, Send</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        </div>
    `;
      companyContainer.appendChild(buttonsContainer);

      // Add event listeners for the email functionality
      const sendEmailBtn = buttonsContainer.querySelector(".send-email-btn");
      const confirmationDialog = buttonsContainer.querySelector(
        ".confirmation-dialog"
      );
      const confirmBtn = buttonsContainer.querySelector(".confirm-btn");
      const cancelBtn = buttonsContainer.querySelector(".cancel-btn");

      sendEmailBtn.addEventListener("click", () => {
        confirmationDialog.classList.remove("hidden");
      });

      confirmBtn.addEventListener("click", () => {
        // Collect all email addresses from the company
        const emails = [company.kontakt_email1, company.kontakt_email2].filter(
          (email) => email && email !== "N/A"
        );

        if (emails.length > 0) {
          window.location.href = `mailto:${emails.join(",")}`;
        } else {
          alert("No email addresses found");
        }
        confirmationDialog.classList.add("hidden");
      });

      cancelBtn.addEventListener("click", () => {
        confirmationDialog.classList.add("hidden");
      });

      // Add "View Candidates" button
      const viewCandidatesBtn = document.createElement("button");
      viewCandidatesBtn.className = "view-candidates-btn";
      viewCandidatesBtn.innerHTML = `
        <i class="fas fa-users"></i> View Matched Candidates
      `;

      // Add click handler for the View Candidates button
      viewCandidatesBtn.addEventListener("click", async () => {
        try {
          // Fetch candidates for this company
          const candidatesResponse = await fetch(
            `/api/getCandidates/${company.id}`
          );
          if (!candidatesResponse.ok) {
            throw new Error("Failed to fetch candidates");
          }

          const candidates = await candidatesResponse.json();

          // Create modal to display candidates
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
                    <h4>${candidate.full_name}</h4>
                    <p><strong>Experience:</strong> ${
                      candidate.total_workexperience
                    }</p>
                    <p><strong>Tech Stack:</strong> ${candidate.techterms}</p>
                    <p><strong>Expected Salary:</strong> ${Number(
                      candidate.expected_salary
                    ).toLocaleString()}</p>
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
          closeBtn.addEventListener("click", () => {
            modal.remove();
          });

          // Close modal when clicking outside
          modal.addEventListener("click", (e) => {
            if (e.target === modal) {
              modal.remove();
            }
          });
        } catch (error) {
          console.error("Error loading candidates:", error);
          showNotification("Failed to load candidates", false);
        }
      });

      companyContainer.appendChild(viewCandidatesBtn);
      companiesSection.appendChild(companyContainer);
    });

    // Add pagination controls if needed
    if (metadata.totalPages > 1) {
      const paginationContainer = document.createElement("div");
      paginationContainer.className = "pagination";
      // Add pagination UI here
    }
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

// Function to handle company dropdown
function handleCompanyDropdown(companyContainer, companyTable, dropdownBtn) {
  // Select ONLY rows from the company table, not from nested candidate tables
  const companyHiddenRows = Array.from(
    companyTable.querySelectorAll("tbody > tr.company-hidden")
  ).filter((row) => row.closest("table") === companyTable);

  // Initially hide rows
  companyHiddenRows.forEach((row) => {
    row.style.display = "none";
  });

  dropdownBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isExpanded = dropdownBtn.classList.contains("active");

    dropdownBtn.classList.toggle("active");
    companyContainer.classList.toggle("expanded");

    // Only toggle company rows
    companyHiddenRows.forEach((row) => {
      row.style.display = isExpanded ? "none" : "table-row";
    });

    dropdownBtn.innerHTML = isExpanded
      ? 'Show More Company Info <i class="fas fa-caret-down"></i>'
      : 'Show Less Company Info <i class="fas fa-caret-up"></i>';
  });
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

function setupEditableField(
  container,
  originalValue,
  fieldKey,
  fieldType,
  company,
  companyIndex
) {
  const editBtn = container.querySelector(".edit-btn");
  const editForm = container.querySelector(".edit-form");
  const input = container.querySelector("input");
  const saveBtn = container.querySelector(".save-btn");
  const cancelBtn = container.querySelector(".cancel-btn");
  const displayValue = container.querySelector(".display-value");

  editBtn.addEventListener("click", () => {
    editBtn.parentElement.classList.add("hidden");
    editForm.classList.remove("hidden");
    input.value = originalValue === "N/A" ? "" : originalValue;
    input.focus();
  });

  saveBtn.addEventListener("click", async () => {
    const newValue = input.value.trim();

    try {
      const response = await fetch("/api/updateData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyIndex: companyIndex,
          fieldKey: fieldKey,
          value: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      const result = await response.json();

      if (result.success) {
        if (fieldType === "phone") {
          displayValue.innerHTML = `
            <a href="tel:${newValue}" class="link phone-link">
              <i class="fas fa-phone"></i> ${newValue}
            </a>
            <button class="edit-btn" title="Edit phone">
              <i class="fas fa-edit"></i> Edit
            </button>
          `;
        } else if (fieldType === "email") {
          displayValue.innerHTML = `
            <a href="mailto:${newValue}" class="link email-link">
              <i class="fas fa-envelope"></i> ${newValue}
            </a>
            <button class="edit-btn" title="Edit email">
              <i class="fas fa-edit"></i> Edit
            </button>
          `;
        }

        company[fieldKey] = newValue;
        editForm.classList.add("hidden");
        displayValue.classList.remove("hidden");

        const successMsg = document.createElement("div");
        successMsg.className = "success-message";
        successMsg.textContent = `${fieldType} updated successfully!`;
        container.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 2000);
      } else {
        throw new Error(result.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      errorMsg.textContent = `Failed to save ${fieldType}`;
      container.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 2000);
    }
  });

  cancelBtn.addEventListener("click", () => {
    input.value = originalValue === "N/A" ? "" : originalValue;
    editForm.classList.add("hidden");
    displayValue.classList.remove("hidden");
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

function validateInput(value, type) {
  switch (type) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case "phone":
      return /^[\d\s\-\+]{8,}$/.test(value);
    default:
      return value.trim().length > 0;
  }
}

// Update the saveToJSON function
async function saveToJSON(company, fieldKey, companyIndex) {
  try {
    const response = await fetch(`${CONFIG.baseURL}/updateField`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyIndex: companyIndex,
        fieldKey: fieldKey,
        value: company[fieldKey],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save changes: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      showNotification(`${fieldKey} updated successfully`, true);
      return true;
    } else {
      throw new Error(result.error || "Failed to save changes");
    }
  } catch (error) {
    console.error("Error saving to JSON:", error);
    showNotification(`Error saving data: ${error.message}`, false);
    return false;
  }
}

// Function to handle candidate dropdown - update this function
function handleCandidateDropdown(
  candidateContainer,
  candidateTable,
  dropdownBtn
) {
  // Select only hidden rows from THIS specific candidate table
  const candidateHiddenRows = Array.from(
    candidateTable.querySelectorAll("tr.candidate-extra-row.hidden")
  );

  // Initially hide rows
  candidateHiddenRows.forEach((row) => {
    row.style.display = "none";
  });

  dropdownBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();

    dropdownBtn.classList.toggle("active");
    candidateTable.classList.toggle("expanded");
    const isActive = dropdownBtn.classList.contains("active");

    // Toggle visibility of hidden rows
    candidateHiddenRows.forEach((row) => {
      row.style.display = isActive ? "table-row" : "none";
    });

    dropdownBtn.innerHTML = isActive
      ? 'Show Less Candidate Info <i class="fas fa-caret-up"></i>'
      : 'Show More Candidate Info <i class="fas fa-caret-down"></i>';
  });

  return dropdownBtn;
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

function createEditableEmailField(value, containerId) {
  return `
    <div id="${containerId}" class="editable-field">
      <div class="display-value">
        ${
          value === "N/A" || !value
            ? '<span class="empty-field">No email provided</span>'
            : `<a href="mailto:${value}" class="link email-link">
              <i class="fas fa-envelope"></i> ${value}
             </a>`
        }
        <button class="edit-btn" title="Edit email">
          <i class="fas fa-edit"></i> Edit
        </button>
      </div>
      <div class="edit-form hidden">
        <input type="email" class="form-input" value="${
          value === "N/A" ? "" : value
        }" placeholder="Enter email address">
        <div class="button-group">
          <button class="save-btn">
            <i class="fas fa-check"></i> Save
          </button>
          <button class="cancel-btn">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    </div>
  `;
}

function createEditablePhoneField(value, containerId) {
  return `
    <div id="${containerId}" class="editable-field">
      <div class="display-value">
        ${
          value === "N/A" || !value
            ? '<span class="empty-field">No phone number provided</span>'
            : `<a href="tel:${value}" class="link phone-link">
              <i class="fas fa-phone"></i> ${value}
             </a>`
        }
        <button class="edit-btn" title="Edit phone">
          <i class="fas fa-edit"></i> Edit
        </button>
      </div>
      <div class="edit-form hidden">
        <input type="tel" class="form-input" value="${
          value === "N/A" ? "" : value
        }" placeholder="Enter phone number">
        <div class="button-group">
          <button class="save-btn">
            <i class="fas fa-check"></i> Save
          </button>
          <button class="cancel-btn">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    </div>
  `;
}
