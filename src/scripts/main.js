// Add this at the top of your file
const CONFIG = {
  isProduction: true, // Change to true when deploying
  get baseURL() {
    return this.isProduction
      ? "https://wisecloud.se" // Remove /recruitmentportal/homepage-project-1 from here
      : "http://localhost:3000";
  },
};

// Helper function to show notifications
function showNotification(message, isSuccess) {
  const notification = document.createElement("div");
  notification.className = `notification ${
    isSuccess ? "success-notification" : "error-notification"
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const companiesSection = document.getElementById("companies");

    if (!companiesSection) {
      throw new Error("Companies section not found!");
    }

    const response = await fetch(
      `${CONFIG.baseURL}/recruitmentportal/homepage-project-1/src/data/Companies_and_candidates.json`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Process companies
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
          const containerId = `email-container-${field.key}-${index}`;
          const isNA = !value || value === "N/A";
          const isEditable = isNA; // Only editable if empty/N/A

          row.innerHTML = `
                        <td class="info-label">${field.label}</td>
                        <td class="info-value">
                            <div class="editable-field" id="${containerId}">
                                ${
                                  isNA
                                    ? `<span class="empty-field">No email provided</span>`
                                    : `<a href="mailto:${value}" class="link email-link">
                                        <i class="fas fa-envelope"></i> ${value}
                                    </a>`
                                }
                                ${
                                  isEditable
                                    ? `<button class="edit-btn" title="Add email">
                                        <i class="fas fa-plus"></i> Add Email
                                    </button>
                                    <div class="edit-form hidden">
                                        <input type="email" value="" placeholder="Enter email address">
                                        <div class="button-group">
                                            <button class="save-btn"><i class="fas fa-check"></i></button>
                                            <button class="cancel-btn"><i class="fas fa-times"></i></button>
                                        </div>
                                    </div>`
                                    : `<span class="uneditable-email">
                                        <i class="fas fa-lock"></i> Email cannot be edited
                                    </span>`
                                }
                            </div>
                        </td>
                    `;

          if (isEditable) {
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
          }
        } else if (field.key.toLowerCase().includes("telefon")) {
          const containerId = `phone-container-${field.key}-${index}`;
          const isNA = !value || value === "N/A" || value === "none";
          const isEditable = isNA; // Only editable if empty/N/A/none

          row.innerHTML = `
                        <td class="info-label">${field.label}</td>
                        <td class="info-value">
                            <div class="editable-field" id="${containerId}">
                                ${
                                  isNA
                                    ? `<span class="empty-field">No phone number provided</span>`
                                    : `<a href="tel:${value}" class="link phone-link">
                                        <i class="fas fa-phone"></i> ${value}
                                    </a>`
                                }
                                ${
                                  isEditable
                                    ? `<button class="edit-btn" title="Add phone number">
                                        <i class="fas fa-plus"></i> Add Phone
                                    </button>
                                    <div class="edit-form hidden">
                                        <input type="tel" value="" placeholder="Enter phone number">
                                        <div class="button-group">
                                            <button class="save-btn"><i class="fas fa-check"></i></button>
                                            <button class="cancel-btn"><i class="fas fa-times"></i></button>
                                        </div>
                                    </div>`
                                    : `<span class="uneditable-phone">
                                        <i class="fas fa-lock"></i> Phone cannot be edited
                                    </span>`
                                }
                            </div>
                        </td>
                    `;

          if (isEditable) {
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
          }
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

      // In your code where you create the candidates section, modify it like this:
      if (
        company.matched_candidates &&
        Array.isArray(company.matched_candidates)
      ) {
        // Create a separate container for all candidates
        const candidatesWrapper = document.createElement("div");
        candidatesWrapper.className = "candidates-wrapper";

        // Add the candidates heading
        const candidatesHeading = document.createElement("h3");
        candidatesHeading.innerHTML =
          '<i class="fas fa-users"></i> Matched Candidates';
        candidatesHeading.className = "candidates-heading";
        candidatesWrapper.appendChild(candidatesHeading);

        company.matched_candidates?.forEach((candidate, candidateIndex) => {
          if (!candidate) return; // Skip if candidate is undefined

          // Create individual candidate container
          const candidateContainer = document.createElement("div");
          candidateContainer.className = "candidate-container";

          // Add candidate header with name
          const candidateHeader = document.createElement("div");
          candidateHeader.className = "candidate-header";
          candidateHeader.innerHTML = `
            <div class="candidate-header-content" data-company-index="${index}" data-candidate-index="${candidateIndex}">
                <div class="candidate-name">
                    <i class="fas fa-user"></i> ${
                      candidate.full_name || `Candidate ${candidateIndex + 1}`
                    }
                </div>
                ${createDeleteButton(candidateIndex)}
            </div>
        `;
          candidateContainer.appendChild(candidateHeader);

          // Add this after creating the candidate header
          const deleteBtn = candidateHeader.querySelector(".delete-btn");
          const deleteConfirmation = candidateHeader.querySelector(
            ".delete-confirmation-overlay"
          );
          const confirmDeleteBtn =
            candidateHeader.querySelector(".confirm-delete");
          const cancelDeleteBtn =
            candidateHeader.querySelector(".cancel-delete");

          deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteConfirmation.classList.remove("hidden");
          });

          cancelDeleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteConfirmation.classList.add("hidden");
          });

          confirmDeleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const headerContent = e.target.closest(".candidate-header-content");
            const companyIndex = parseInt(headerContent.dataset.companyIndex);
            const candidateIndex = parseInt(
              headerContent.dataset.candidateIndex
            );

            try {
              const response = await fetch(
                `${CONFIG.baseURL}/deleteCandidate`,
                {
                  // Add full URL
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    companyIndex: companyIndex, // Make sure these values are defined
                    candidateIndex: candidateIndex,
                  }),
                }
              );

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                  `HTTP error! status: ${response.status}, body: ${errorText}`
                );
              }

              const result = await response.json();

              if (result.success) {
                showNotification("Candidate deleted successfully", true);
                candidateContainer.remove();
              } else {
                throw new Error(result.error || "Failed to delete candidate");
              }
            } catch (error) {
              console.error("Delete failed:", error);
              showNotification(
                `Failed to delete candidate: ${error.message}`,
                false
              );
            } finally {
              deleteConfirmation.classList.add("hidden");
            }
          });

          // Create candidate table
          const candidateTable = document.createElement("table");
          candidateTable.className = "info-table candidate-table";

          // Add table header
          candidateTable.appendChild(
            createTableHeader("Candidate Information", "Details")
          );

          const candidateTbody = document.createElement("tbody");

          // Define default candidate fields to show
          const defaultCandidateFields = [
            { label: "Total Work Experience", key: "total_workexperience" },
            { label: "Techterms", key: "techterms" },
            { label: "Description", key: "description" },
            { label: "Resume", key: "resume" },
            { label: "Expected Salary", key: "expected_salary" },
            { label: "Expected Cost", key: "expected_cost" }, // Make sure this line exists
          ];

          // Add default candidate information rows (first 6 rows)
          defaultCandidateFields.forEach((field) => {
            const row = document.createElement("tr");
            row.className = "candidate-row visible"; // Add visible class
            let value = candidate[field.key] || "N/A";

            // Check if the field is an email or phone
            if (field.key.toLowerCase().includes("email")) {
              row.innerHTML = `
                    <td class="info-label">${field.label}</td>
                    <td class="info-value">${createEmailLink(value)}</td>
                `;
            } else if (
              field.key.toLowerCase().includes("phone") ||
              field.key.toLowerCase().includes("telefon")
            ) {
              row.innerHTML = `
                    <td class="info-label">${field.label}</td>
                    <td class="info-value">${createPhoneLink(value)}</td>
                `;
            } else if (field.key === "expected_salary") {
              const containerId = `salary-${index}-${candidateIndex}`;
              row.innerHTML = `
                <td class="info-label">${field.label}</td>
                <td class="info-value">${createEditableSalaryField(
                  value,
                  containerId
                )}</td>
              `;

              setTimeout(() => {
                const container = document.getElementById(containerId);
                if (container) {
                  setupSalaryEditor(
                    container,
                    value,
                    candidate,
                    index,
                    candidateIndex
                  );
                }
              }, 0);
            } else if (field.key === "expected_cost") {
              const containerId = `cost-${index}-${candidateIndex}`;
              row.innerHTML = `
                <td class="info-label">${field.label}</td>
                <td class="info-value">${createEditableCostField(
                  value,
                  containerId
                )}</td>
              `;

              setTimeout(() => {
                const container = document.getElementById(containerId);
                if (container) {
                  setupCostEditor(
                    container,
                    value,
                    candidate,
                    index,
                    candidateIndex
                  );
                }
              }, 0);
            } else {
              row.innerHTML = `
                    <td class="info-label">${field.label}</td>
                    <td class="info-value">${value}</td>
                `;
            }

            candidateTbody.appendChild(row);
          });

          // Add hidden class to non-default fields
          Object.entries(candidate).forEach(([key, value]) => {
            if (!defaultCandidateFields.some((field) => field.key === key)) {
              const row = document.createElement("tr");
              // Update class names to be more specific
              row.className = "candidate-extra-row hidden";
              row.setAttribute("data-candidate-id", candidateIndex); // Add data attribute
              row.style.display = "none";

              // Check if the field is an email or phone
              if (key.toLowerCase().includes("email")) {
                row.innerHTML = `
                        <td class="info-label">${key
                          .replace(/_/g, " ")
                          .toUpperCase()}</td>
                        <td class="info-value">${createEmailLink(value)}</td>
                    `;
              } else if (
                key.toLowerCase().includes("phone") ||
                key.toLowerCase().includes("telefon")
              ) {
                row.innerHTML = `
                        <td class="info-label">${key
                          .replace(/_/g, " ")
                          .toUpperCase()}</td>
                        <td class="info-value">${createPhoneLink(value)}</td>
                    `;
              } else {
                row.innerHTML = `
                        <td class="info-label">${key
                          .replace(/_/g, " ")
                          .toUpperCase()}</td>
                        <td class="info-value">${value || "N/A"}</td>
                    `;
              }

              candidateTbody.appendChild(row);
            }
          });

          candidateTable.appendChild(candidateTbody);
          candidateContainer.appendChild(candidateTable);

          // Add candidate dropdown button
          const candidateDropdownBtn = document.createElement("button");
          candidateDropdownBtn.className = "candidate-only-dropdown";
          candidateDropdownBtn.setAttribute("data-table-id", candidateTable.id); // Add this line
          candidateDropdownBtn.innerHTML =
            'Show More Candidate Info <i class="fas fa-caret-down"></i>';
          candidateContainer.appendChild(candidateDropdownBtn);

          // Update how you call handleCandidateDropdown
          const updatedBtn = handleCandidateDropdown(
            candidateContainer,
            candidateTable,
            candidateDropdownBtn
          );

          candidatesWrapper.appendChild(candidateContainer);
        });

        // Append the entire candidates wrapper after the company container
        companyContainer.parentNode.insertBefore(
          candidatesWrapper,
          companyContainer.nextSibling
        );
      }
    });
  } catch (error) {
    console.error("Error loading data:", error);
    showNotification("Failed to load company data", false);
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
      const response = await fetch(`${CONFIG.baseURL}/updateField`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyIndex: companyIndex,
          candidateIndex: candidateIndex,
          fieldKey: "expected_salary",
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
        successMsg.textContent = "Salary updated successfully";
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

  editBtn.addEventListener("click", () => {
    editBtn.classList.add("hidden");
    editForm.classList.remove("hidden");
    input.value = originalValue === "N/A" ? "" : originalValue;
    input.focus();
  });

  saveBtn.addEventListener("click", async () => {
    const newValue = input.value.trim();

    if (validateInput(newValue, fieldType)) {
      try {
        const response = await fetch(`${CONFIG.baseURL}/updateField`, {
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
          // Update the display
          const emptyField = container.querySelector(".empty-field");
          if (emptyField) {
            if (fieldType === "phone") {
              emptyField.outerHTML = `
                <a href="tel:${newValue}" class="link phone-link">
                    <i class="fas fa-phone"></i> ${newValue}
                </a>`;
            } else if (fieldType === "email") {
              emptyField.outerHTML = `
                <a href="mailto:${newValue}" class="link email-link">
                    <i class="fas fa-envelope"></i> ${newValue}
                </a>`;
            }
          }

          company[fieldKey] = newValue;
          editForm.classList.add("hidden");
          editBtn.classList.add("hidden");

          const successMsg = document.createElement("div");
          successMsg.className = "success-message";
          successMsg.textContent = `${fieldType} added successfully!`;
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
    } else {
      alert(`Please enter a valid ${fieldType}`);
    }
  });

  cancelBtn.addEventListener("click", () => {
    input.value = "";
    editForm.classList.add("hidden");
    editBtn.classList.remove("hidden");
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

// Add this function to handle salary editing
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
      const response = await fetch(`${CONFIG.baseURL}/updateField`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyIndex: companyIndex,
          candidateIndex: candidateIndex,
          fieldKey: "expected_salary",
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
        successMsg.textContent = "Salary updated successfully";
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
                        <button class="confirm-delete btn-danger">Yes, Delete</button>
                        <button class="cancel-delete btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Modify your candidate header creation in the main code where you create candidate containers
const candidateContainer = document.createElement("div");
candidateContainer.className = "candidate-container";

// Create candidate header with delete button
const candidateHeader = document.createElement("div");
candidateHeader.className = "candidate-header";
candidateHeader.innerHTML = `
    <div class="candidate-header-content">
        <div class="candidate-name">
            <i class="fas fa-user"></i> ${
              candidate.full_name || `Candidate ${candidateIndex + 1}`
            }
        </div>
        ${createDeleteButton(candidateIndex)}
    </div>
`;

// Insert the candidate header at the top of the container
candidateContainer.appendChild(candidateHeader);

// Add this after creating the candidate header
const deleteBtn = candidateHeader.querySelector(".delete-btn");
const deleteConfirmation = candidateHeader.querySelector(
  ".delete-confirmation-overlay"
);
const confirmDeleteBtn = candidateHeader.querySelector(".confirm-delete");
const cancelDeleteBtn = candidateHeader.querySelector(".cancel-delete");

deleteBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  deleteConfirmation.classList.remove("hidden");
});

cancelDeleteBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  deleteConfirmation.classList.add("hidden");
});

confirmDeleteBtn.addEventListener("click", async (e) => {
  e.stopPropagation();
  try {
    const response = await fetch(`${CONFIG.baseURL}/deleteCandidate`, {
      // Add full URL
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyIndex: index, // Make sure these values are defined
        candidateIndex: candidateIndex,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const result = await response.json();

    if (result.success) {
      showNotification("Candidate deleted successfully", true);
      candidateContainer.remove();
    } else {
      throw new Error(result.error || "Failed to delete candidate");
    }
  } catch (error) {
    console.error("Delete failed:", error);
    showNotification(`Failed to delete candidate: ${error.message}`, false);
  } finally {
    deleteConfirmation.classList.add("hidden");
  }
});

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
      const response = await fetch(`${CONFIG.baseURL}/updateField`, {
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
        const errorText = await response.text(); // Capture the error text
        throw new Error(
          `Failed to save changes: ${response.status} - ${errorText}`
        ); // Include error text in the error message
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
      alert(`Failed to save changes: ${error.message}`); // Display the error message
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
