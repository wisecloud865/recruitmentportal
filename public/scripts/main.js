// Add this function at the top level
async function loadCompaniesPage(pageNumber) {
  const companiesResponse = await fetch(
    `/public/companies/page_${pageNumber}.json`
  );
  if (!companiesResponse.ok) {
    throw new Error(`HTTP error! status: ${companiesResponse.status}`);
  }
  return await companiesResponse.json();
}

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

// Add these helper functions at the top of your file
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

function setupEditableField(
  container,
  initialValue,
  fieldKey,
  type,
  company,
  index
) {
  if (!container) return;

  const displayValue = container.querySelector(".display-value");
  const editForm = container.querySelector(".edit-form");
  const editBtn = container.querySelector(".edit-btn");
  const saveBtn = container.querySelector(".save-btn");
  const cancelBtn = container.querySelector(".cancel-btn");
  const input = container.querySelector(".form-input");

  editBtn.addEventListener("click", () => {
    displayValue.classList.add("hidden");
    editForm.classList.remove("hidden");
    input.focus();
  });

  saveBtn.addEventListener("click", async () => {
    const newValue = input.value.trim();
    if (newValue === initialValue) {
      displayValue.classList.remove("hidden");
      editForm.classList.add("hidden");
      return;
    }

    try {
      // Here you would typically update the value in your backend
      company[fieldKey] = newValue;

      // Update the display
      const linkContainer = displayValue.querySelector(
        type === "email" ? ".email-link" : ".phone-link"
      );
      if (newValue) {
        if (linkContainer) {
          linkContainer.href =
            type === "email" ? `mailto:${newValue}` : `tel:${newValue}`;
          linkContainer.innerHTML = `<i class="fas fa-${
            type === "email" ? "envelope" : "phone"
          }"></i> ${newValue}`;
        } else {
          displayValue.innerHTML = `
            <a href="${type === "email" ? "mailto:" : "tel:"}${newValue}" 
               class="link ${type}-link">
              <i class="fas fa-${
                type === "email" ? "envelope" : "phone"
              }"></i> ${newValue}
            </a>
            <button class="edit-btn" title="Edit ${type}">
              <i class="fas fa-edit"></i> Edit
            </button>
          `;
        }
      } else {
        displayValue.innerHTML = `
          <span class="empty-field">No ${type} provided</span>
          <button class="edit-btn" title="Edit ${type}">
            <i class="fas fa-edit"></i> Edit
          </button>
        `;
      }

      displayValue.classList.remove("hidden");
      editForm.classList.add("hidden");
      showNotification(
        `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`,
        true
      );
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      showNotification(`Failed to update ${type}`, false);
    }
  });

  cancelBtn.addEventListener("click", () => {
    input.value = initialValue;
    displayValue.classList.remove("hidden");
    editForm.classList.add("hidden");
  });
}

// Function to handle company dropdown
function handleCompanyDropdown(companyContainer, companyTable, dropdownBtn) {
  // Select ONLY rows from the company table with company-hidden class
  const hiddenRows = Array.from(
    companyTable.querySelectorAll("tr.company-hidden")
  );

  // Initially hide rows
  hiddenRows.forEach((row) => {
    row.style.display = "none";
  });

  dropdownBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isExpanded = dropdownBtn.classList.contains("active");

    // Toggle button active state
    dropdownBtn.classList.toggle("active");
    companyContainer.classList.toggle("expanded");

    // Toggle visibility of hidden rows
    hiddenRows.forEach((row) => {
      row.style.display = isExpanded ? "none" : "table-row";
    });

    // Update button text and icon
    dropdownBtn.innerHTML = isExpanded
      ? 'Show More Company Info <i class="fas fa-caret-down"></i>'
      : 'Show Less Company Info <i class="fas fa-caret-up"></i>';
  });
}

// Update the createCompanyTitle function
function createCompanyTitle(company) {
  const companyName = company.företagsnamn || "N/A";
  const companyTypeIndicators = createCompanyTypeIndicators(company);

  return `
    <div class="company-header">
      <h2 class="table-title1">
        <i class="fas fa-building"></i>
        ${companyName}
        <div class="company-type-indicators">
          ${companyTypeIndicators}
        </div>
      </h2>
      <button class="send-email-btn">
        <i class="fas fa-envelope"></i> Send Email
      </button>
    </div>
  `;
}

function createCompanyTypeIndicators(company) {
  // Check if company is consultant or recruitment
  const isConsultant =
    company.consultantcompany === true || company.consultantcompany === "true";
  const isRecruitment =
    company.recruitmentcompany === true ||
    company.recruitmentcompany === "true";

  // Return only one dot based on type
  if (isConsultant) {
    return '<span class="legend-dot black" title="Consultant Company"></span>';
  } else if (isRecruitment) {
    return '<span class="legend-dot pink" title="Recruitment Company"></span>';
  }

  return ""; // Return empty if neither type
}

// Add this function after the createCompanyTitle function
function createTableHeader(col1, col2) {
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th class="info-label">${col1}</th>
      <th class="info-value">${col2}</th>
    </tr>
  `;
  return thead;
}

// Add these helper functions at the top of your file
function createWebLink(value) {
  if (value === "N/A" || !value) {
    return '<span class="empty-field">No website provided</span>';
  }

  // Add https:// if not present
  const url = value.startsWith("http") ? value : `https://${value}`;
  return `
    <a href="${url}" 
       class="link web-link" 
       target="_blank" 
       rel="noopener noreferrer">
      <i class="fas fa-globe"></i> ${value}
    </a>
  `;
}

// Function to show candidates modal
function showCandidatesModal(candidates, companyName) {
  const modal = document.createElement("div");
  modal.className = "candidates-modal";
  modal.innerHTML = `
    <div class="candidates-modal-content">
      <div class="candidates-modal-header">
        <h3>Matched Candidates for ${companyName}</h3>
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
}

// Update your DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const companiesSection = document.getElementById("companies");
    if (!companiesSection) {
      throw new Error("Companies section not found!");
    }

    // Add Back to Top button
    const backToTopBtn = document.createElement("button");
    backToTopBtn.className = "back-to-top";
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTopBtn);

    // Handle Back to Top visibility
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });

    // Handle Back to Top click
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // First load metadata to get total pages
    const metadataResponse = await fetch("/public/companies/metadata.json");
    if (!metadataResponse.ok) {
      throw new Error(`HTTP error! status: ${metadataResponse.status}`);
    }
    const metadata = await metadataResponse.json();

    // Move pagination container to companiesSection
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "pagination-controls";
    companiesSection.appendChild(paginationContainer);

    // Function to render companies for a page
    async function renderCompaniesPage(pageNumber) {
      try {
        const existingCompanies =
          companiesSection.querySelectorAll(".company-container");
        existingCompanies.forEach((container) => container.remove());

        const pageData = await loadCompaniesPage(pageNumber);
        const companies = pageData.companies;

        companies.forEach((company, index) => {
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

          // Add default company fields
          defaultCompanyFields.forEach((field) => {
            const row = document.createElement("tr");
            row.className = "company-row";
            let value = company[field.key] || "N/A";

            if (field.key.toLowerCase().includes("webb")) {
              row.innerHTML = `
                <td class="info-label">${field.label}</td>
                <td class="info-value">${createWebLink(value)}</td>
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

              setTimeout(
                () =>
                  setupEditableField(
                    document.getElementById(containerId),
                    value,
                    field.key,
                    "email",
                    company,
                    index
                  ),
                0
              );
            } else if (field.key.toLowerCase().includes("telefon")) {
              const containerId = `phone-${field.key}-${index}`;
              row.innerHTML = `
                <td class="info-label">${field.label}</td>
                <td class="info-value">${createEditablePhoneField(
                  value,
                  containerId
                )}</td>
              `;

              setTimeout(
                () =>
                  setupEditableField(
                    document.getElementById(containerId),
                    value,
                    field.key,
                    "phone",
                    company,
                    index
                  ),
                0
              );
            } else {
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
              key !== "id" &&
              key !== "företagsnamn" &&
              key !== "consultantcompany" &&
              key !== "recruitmentcompany"
            ) {
              const row = document.createElement("tr");
              row.className = "company-hidden"; // Add this class for hidden rows
              row.style.display = "none"; // Initially hide the row
              row.innerHTML = `
                <td class="info-label">${key
                  .replace(/_/g, " ")
                  .toUpperCase()}</td>
                <td class="info-value">${formatValue(value)}</td>
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
          handleCompanyDropdown(
            companyContainer,
            companyTable,
            companyDropdownBtn
          );

          // Add View Candidates button
          const viewCandidatesBtn = document.createElement("button");
          viewCandidatesBtn.className = "view-candidates-btn";
          viewCandidatesBtn.innerHTML =
            '<i class="fas fa-users"></i> View Matched Candidates';
          companyContainer.appendChild(viewCandidatesBtn);

          // Handle View Candidates click
          viewCandidatesBtn.addEventListener("click", async () => {
            try {
              const candidatesResponse = await fetch(
                `/public/candidates/company_${company.id}.json`
              );
              if (!candidatesResponse.ok) {
                throw new Error("No candidates found");
              }

              const candidates = await candidatesResponse.json();
              showCandidatesModal(candidates, company.företagsnamn);
            } catch (error) {
              console.error("Error loading candidates:", error);
              showNotification("No candidates found for this company", false);
            }
          });

          companiesSection.appendChild(companyContainer);
        });

        updatePaginationControls(pageNumber, metadata.totalPages);
      } catch (error) {
        console.error("Error loading page:", error);
        showNotification(`Failed to load page ${pageNumber}`, false);
      }
    }

    // Function to update pagination controls
    function updatePaginationControls(currentPage, totalPages) {
      paginationContainer.innerHTML = `
        <button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} 
                onclick="loadPage(${currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">${currentPage} / ${totalPages}</span>
        <button class="pagination-btn" ${
          currentPage === totalPages ? "disabled" : ""
        } 
                onclick="loadPage(${currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
        </button>
      `;
    }

    // Add global function to handle page changes
    window.loadPage = async (pageNumber) => {
      await renderCompaniesPage(pageNumber);
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Load first page initially
    await renderCompaniesPage(1);
  } catch (error) {
    console.error("Error details:", error);
    document.getElementById(
      "companies"
    ).innerHTML = `<p class="error-message">Failed to load data: ${error.message}</p>`;
  }
});
