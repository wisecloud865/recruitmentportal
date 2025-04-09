document.addEventListener("DOMContentLoaded", async () => {
  try {
    const candidatesSection = document.getElementById("candidates");
    if (!candidatesSection) {
      throw new Error("Candidates section not found!");
    }

    // Create single instance of containers
    const candidatesContainer = document.createElement("div");
    candidatesContainer.className = "tables-container";
    candidatesSection.appendChild(candidatesContainer);

    // Update to fetch from API instead of local file
    const response = await fetch("/api/getData");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data successfully loaded:", data);

    // Process companies
    data.forEach((company, index) => {
      // Candidates heading
      const candidatesHeading = document.createElement("h3");
      candidatesHeading.innerHTML = '<i class="fas fa-users"></i> Candidates';
      candidatesHeading.className = "candidates-heading"; // Add the class
      candidatesContainer.appendChild(candidatesHeading);

      // Process matched candidates for each company
      if (company.matched_candidates && company.matched_candidates.length > 0) {
        // Create a container for the candidate tables to display them in a row
        const candidatesRowContainer = document.createElement("div");
        candidatesRowContainer.className = "tables-container"; // Use tables-container for row layout
        candidatesContainer.appendChild(candidatesRowContainer);

        company.matched_candidates.forEach((candidate, candidateIndex) => {
          const candidateContainer = document.createElement("div");
          candidateContainer.className = "table-container";

          // Create the h3 element
          const candidateTitle = document.createElement("h3");
          candidateTitle.className = "table-title";
          candidateTitle.innerHTML = `<i class="fas fa-user"></i> ${
            candidate.full_name || `Candidate ${candidateIndex + 1}`
          }`;
          candidateContainer.appendChild(candidateTitle);

          const candidateTable = document.createElement("table");
          candidateTable.className = "info-table";
          candidateTable.appendChild(
            createTableHeader("Candidate Information", "Details")
          );

          const candidateTbody = document.createElement("tbody");
          const defaultFields = [
            "total_workexperience",
            "techterms",
            "current_company",
          ];

          // Sort entries to show default fields first
          const sortedEntries = Object.entries(candidate).sort(
            ([keyA], [keyB]) => {
              const indexA = defaultFields.indexOf(keyA);
              const indexB = defaultFields.indexOf(keyB);

              if (indexA === -1 && indexB === -1) return 0; // Neither is a default field, keep original order
              if (indexA === -1) return 1; // A is not a default field, move B up
              if (indexB === -1) return -1; // B is not a default field, move A up

              return indexA - indexB; // Both are default fields, sort by their order in defaultFields
            }
          );

          sortedEntries.forEach(([key, value], rowIndex) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                            <td class="info-label">${key
                              .replace(/_/g, " ")
                              .toUpperCase()}</td>
                            <td class="info-value">${
                              typeof value === "object"
                                ? JSON.stringify(value)
                                : value
                            }</td>
                        `;
            candidateTbody.appendChild(row);

            // Hide rows after the first 3
            if (rowIndex >= 3) {
              row.classList.add("hidden-row");
            }
          });

          candidateTable.appendChild(candidateTbody);
          candidateContainer.appendChild(candidateTable);
          addDropdownFunctionality(candidateContainer, candidateTable);
          candidatesRowContainer.appendChild(candidateContainer); // Append to the row container
        });
      }
    });
  } catch (error) {
    console.error("Error details:", error);
    candidatesSection.innerHTML = `<p class="error-message">Failed to load candidates: ${error.message}</p>`;
  }
});

function createTableHeader(header1, header2) {
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
        <th class="company-header">${header1}</th>
        <th class="candidate-header">${header2}</th>
    `;
  thead.appendChild(headerRow);
  return thead;
}

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
    const hiddenRows = table.querySelectorAll(".hidden-row");
    hiddenRows.forEach((row) => {
      row.style.display = isExpanded ? "table-row" : "none";
    });
  });

  // Initially hide the rows
  const hiddenRows = table.querySelectorAll(".hidden-row");
  hiddenRows.forEach((row) => {
    row.style.display = "none";
  });
}
