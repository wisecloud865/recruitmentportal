document.addEventListener("DOMContentLoaded", async () => {
  try {
    const companySection = document.getElementById("company");
    if (!companySection) {
      throw new Error("Company section not found!");
    }

    // Update to fetch from API instead of local file
    const response = await fetch("/api/getData");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data successfully loaded:", data);

    if (data.length === 0) {
      companySection.innerHTML = "<p>No company data available.</p>";
      return;
    }

    // Loop through each company in the data
    data.forEach((company) => {
      const companyContainer = document.createElement("div");
      companyContainer.className = "table-container"; // Use table-container class

      const tableTitle = document.createElement("h2");
      tableTitle.className = "table-title";
      tableTitle.textContent = company.företagsnamn || "Company Information";
      companyContainer.appendChild(tableTitle);

      const infoTable = document.createElement("table");
      infoTable.className = "info-table";

      // Create table header
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      headerRow.innerHTML = `
                <th class="info-label">Field</th>
                <th class="info-value">Value</th>
            `;
      thead.appendChild(headerRow);
      infoTable.appendChild(thead);

      const tbody = document.createElement("tbody");

      // Define the fields you want to display
      const fieldsToDisplay = ["företagsnamn", "Produkt", "SEEK"];

      fieldsToDisplay.forEach((key) => {
        let value = company[key] || "N/A";

        const row = document.createElement("tr");
        row.innerHTML = `
                    <td class="info-label">${key
                      .replace(/_/g, " ")
                      .toUpperCase()}</td>
                    <td class="info-value">${value}</td>
                `;
        tbody.appendChild(row);
      });

      // Display Ekonomisiffor
      if (company.Ekonomisiffor) {
        const omsattningRow = document.createElement("tr");
        omsattningRow.innerHTML = `<td class="info-label">Omsättning</td><td class="info-value">${
          company.Ekonomisiffor.Omsättning || "N/A"
        }</td>`;
        tbody.appendChild(omsattningRow);

        const resultatRow = document.createElement("tr");
        resultatRow.innerHTML = `<td class="info-label">Resultat</td><td class="info-value">${
          company.Ekonomisiffor.Resultat || "N/A"
        }</td>`;
        tbody.appendChild(resultatRow);

        const omsattningsforandringRow = document.createElement("tr");
        omsattningsforandringRow.innerHTML = `<td class="info-label">Omsättningsförändring</td><td class="info-value">${
          company.Ekonomisiffor.Omsättningsförändring || "N/A"
        }</td>`;
        tbody.appendChild(omsattningsforandringRow);
      }

      // Add all fields to display
      const allFieldsToDisplay = [
        "företagsnamn",
        "företagswebb",
        "organisationsnummer",
        "publicerad",
        "kontaktperson1",
        "kontakt_email1",
        "kontakt_telefon1",
        "Techstack",
        "Produkt",
        "Företagsstruktur",
        "Ekonomi",
      ];

      // Add remaining fields to the table
      allFieldsToDisplay.slice(fieldsToDisplay.length).forEach((key) => {
        let value = company[key] || "N/A";
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td class="info-label">${key
                      .replace(/_/g, " ")
                      .toUpperCase()}</td>
                    <td class="info-value">${value}</td>
                `;
        tbody.appendChild(row);
      });

      infoTable.appendChild(tbody);
      companyContainer.appendChild(infoTable);

      // Add dropdown functionality
      addDropdownFunctionality(companyContainer, infoTable);

      companySection.appendChild(companyContainer);
    });
  } catch (error) {
    console.error("Error details:", error);
    companySection.innerHTML = `<p class="error-message">Failed to load company data: ${error.message}</p>`;
  }
});

function addDropdownFunctionality(container, table) {
  const dropdownBtn = document.createElement("button");
  dropdownBtn.className = "dropdown-btn";
  dropdownBtn.innerHTML = 'Show More <i class="fas fa-caret-down"></i>';

  container.appendChild(dropdownBtn);

  dropdownBtn.addEventListener("click", function () {
    table.classList.toggle("expanded");
    dropdownBtn.classList.toggle("expanded");
    const isExpanded = table.classList.contains("expanded");
    dropdownBtn.innerHTML = isExpanded
      ? 'Show Less <i class="fas fa-caret-up"></i>'
      : 'Show More <i class="fas fa-caret-down"></i>';

    // Toggle visibility of hidden rows
    const hiddenRows = table.querySelectorAll("tbody tr:nth-child(n+4)");
    hiddenRows.forEach((row) => {
      row.style.display = isExpanded ? "table-row" : "none";
    });
  });

  // Initially hide the rows
  const initialHiddenRows = table.querySelectorAll("tbody tr:nth-child(n+4)");
  initialHiddenRows.forEach((row) => {
    row.style.display = "none";
  });
}
