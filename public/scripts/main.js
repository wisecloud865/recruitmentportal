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

// Function to create company title with indicators
function createCompanyTitle(company) {
  return `
    <div class="company-header">
      <h2 class="company-name">${company.företagsnamn}</h2>
      <div class="company-type-indicators">
        ${
          company.consultantcompany
            ? '<span class="badge consultant">Consultant Company</span>'
            : ""
        }
        ${
          company.recruitmentcompany
            ? '<span class="badge recruitment">Recruitment Company</span>'
            : ""
        }
      </div>
    </div>
  `;
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
              row.className = "company-hidden";
              row.style.display = "none";
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
