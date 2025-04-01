document.addEventListener('DOMContentLoaded', async () => {
    try {
        const companiesSection = document.getElementById('companies');

        if (!companiesSection) {
            throw new Error('Companies section not found!');
        }

        // Update the section title creation with legend
        companiesSection.innerHTML = `
            <div class="title-section">
                <h2 class="table-title">
                    <i class="fas fa-building"></i> Companies and Candidates
                </h2>
                <div class="company-legend">
                    <div class="legend-item">
                        <span class="legend-dot pink"></span>
                        <span class="legend-text">Recruitment Company</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-dot black"></span>
                        <span class="legend-text">Consultant Company</span>
                    </div>
                </div>
            </div>
        `;

        const response = await fetch('./data/Companies_and_candidates.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Process companies
        data.forEach((company, index) => {
            const companyContainer = document.createElement('div');
            companyContainer.className = 'company-container';

            // Create company title with indicators
            const companyTitle = document.createElement('div');
            companyTitle.innerHTML = createCompanyTitle(company);
            companyContainer.appendChild(companyTitle);

            // Company Table
            const companyTable = document.createElement('table');
            companyTable.className = 'info-table';
            companyTable.appendChild(createTableHeader('Company Information', 'Details'));
            const companyTbody = document.createElement('tbody');

            // Define default company fields
            const defaultCompanyFields = [
                { label: 'Titel', key: 'titel' },
                { label: 'Företagswebb', key: 'företagswebb' },
                { label: 'Kontakt Email 1', key: 'kontakt_email1' },
                { label: 'Kontakt Email 2', key: 'kontakt_email2' },
                { label: 'Kontakt Person 1', key: 'kontaktperson1' },
                { label: 'Kontakt Telefon', key: 'kontakt_telefon1' }
            ];

            // Add company information rows
            defaultCompanyFields.forEach(field => {
                const row = document.createElement('tr');
                row.className = 'company-row';
                let value = company[field.key] || 'N/A';

                if (field.key.toLowerCase().includes('webb')) {
                    row.innerHTML = `
                        <td class="info-label">${field.label}</td>
                        <td class="info-value">
                            ${createWebLink(value)}
                        </td>
                    `;
                } else if (field.key.toLowerCase().includes('email')) {
                    const containerId = `email-container-${field.key}-${index}`;
                    const isNA = !value || value === 'N/A';
                    const isEditable = isNA; // Only editable if empty/N/A
                    
                    row.innerHTML = `
                        <td class="info-label">${field.label}</td>
                        <td class="info-value">
                            <div class="editable-field" id="${containerId}">
                                ${isNA ? 
                                    `<span class="empty-field">No email provided</span>` :
                                    `<a href="mailto:${value}" class="link email-link">
                                        <i class="fas fa-envelope"></i> ${value}
                                    </a>`
                                }
                                ${isEditable ? 
                                    `<button class="edit-btn" title="Add email">
                                        <i class="fas fa-plus"></i> Add Email
                                    </button>
                                    <div class="edit-form hidden">
                                        <input type="email" value="" placeholder="Enter email address">
                                        <div class="button-group">
                                            <button class="save-btn"><i class="fas fa-check"></i></button>
                                            <button class="cancel-btn"><i class="fas fa-times"></i></button>
                                        </div>
                                    </div>` :
                                    `<span class="uneditable-email">
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
                                setupEditableField(container, value, field.key, 'email', company, index);
                            }
                        }, 0);
                    }
                } else if (field.key.toLowerCase().includes('telefon')) {
                    const containerId = `phone-container-${field.key}-${index}`;
                    const isNA = !value || value === 'N/A' || value === 'none';
                    const isEditable = isNA; // Only editable if empty/N/A/none
                    
                    row.innerHTML = `
                        <td class="info-label">${field.label}</td>
                        <td class="info-value">
                            <div class="editable-field" id="${containerId}">
                                ${isNA ? 
                                    `<span class="empty-field">No phone number provided</span>` :
                                    `<a href="tel:${value}" class="link phone-link">
                                        <i class="fas fa-phone"></i> ${value}
                                    </a>`
                                }
                                ${isEditable ? 
                                    `<button class="edit-btn" title="Add phone number">
                                        <i class="fas fa-plus"></i> Add Phone
                                    </button>
                                    <div class="edit-form hidden">
                                        <input type="tel" value="" placeholder="Enter phone number">
                                        <div class="button-group">
                                            <button class="save-btn"><i class="fas fa-check"></i></button>
                                            <button class="cancel-btn"><i class="fas fa-times"></i></button>
                                        </div>
                                    </div>` :
                                    `<span class="uneditable-phone">
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
                                setupEditableField(container, value, field.key, 'phone', company, index);
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
                if (!defaultCompanyFields.some(field => field.key === key) && 
                    key !== 'matched_candidates') {
                    const row = document.createElement('tr');
                    row.className = 'company-hidden';
                    row.innerHTML = `
                        <td class="info-label">${key.replace(/_/g, ' ').toUpperCase()}</td>
                        <td class="info-value">${value || 'N/A'}</td>
                    `;
                    companyTbody.appendChild(row);
                }
            });

            companyTable.appendChild(companyTbody);
            companyContainer.appendChild(companyTable);


            // Add company dropdown button
            const companyDropdownBtn = document.createElement('button');
            companyDropdownBtn.className = 'dropdown-btn company-dropdown-btn';
            companyDropdownBtn.innerHTML = 'Show More Company Info <i class="fas fa-caret-down"></i>';
            companyContainer.appendChild(companyDropdownBtn);

            // Setup company dropdown functionality
            handleCompanyDropdown(companyContainer, companyTable, companyDropdownBtn);

            companiesSection.appendChild(companyContainer);

    // Add email button and confirmation dialog
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'action-buttons';
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
    const sendEmailBtn = buttonsContainer.querySelector('.send-email-btn');
    const confirmationDialog = buttonsContainer.querySelector('.confirmation-dialog');
    const confirmBtn = buttonsContainer.querySelector('.confirm-btn');
    const cancelBtn = buttonsContainer.querySelector('.cancel-btn');

    sendEmailBtn.addEventListener('click', () => {
        confirmationDialog.classList.remove('hidden');
    });

    confirmBtn.addEventListener('click', () => {
        // Collect all email addresses from the company
        const emails = [
            company.kontakt_email1,
            company.kontakt_email2
        ].filter(email => email && email !== 'N/A');
        
        if (emails.length > 0) {
            window.location.href = `mailto:${emails.join(',')}`;
        } else {
            alert('No email addresses found');
        }
        confirmationDialog.classList.add('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        confirmationDialog.classList.add('hidden');
    });




    

            // Candidates Section
            if (company.matched_candidates && company.matched_candidates.length > 0) {
                // Add this first - Candidates heading
                const candidatesHeading = document.createElement('h3');
                candidatesHeading.innerHTML = '<i class="fas fa-users"></i> Matched Candidates';
                candidatesHeading.className = 'candidates-heading';
                companyContainer.appendChild(candidatesHeading);

                // Then your existing candidates forEach loop
                company.matched_candidates.forEach((candidate, candidateIndex) => {
                    const candidateContainer = document.createElement('div');
                    candidateContainer.className = 'candidate-container';

                    // Add candidate header with name
                    const candidateHeader = document.createElement('h3');
                    candidateHeader.className = 'candidate-header';
                    candidateHeader.innerHTML = `
                        <i class="fas fa-user"></i> ${candidate.full_name || `Candidate ${candidateIndex + 1}`}
                    `;
                    candidateContainer.appendChild(candidateHeader);

                    // Create candidate table
                    const candidateTable = document.createElement('table');
                    candidateTable.className = 'info-table candidate-table';
                    
                    // Add table header
                    candidateTable.appendChild(createTableHeader('Candidate Information', 'Details'));
                    
                    const candidateTbody = document.createElement('tbody');

                    // Define default candidate fields to show
                    const defaultCandidateFields = [
                        { label: 'Total Work Experience', key: 'total_workexperience' },
                        { label: 'Techterms', key: 'techterms' },
                        { label: 'Description', key: 'description' },
                        { label: 'Resume', key: 'resume' },
                        { label: 'Expected Salary', key: 'expected_salary' },
                        { label: 'Expected Cost', key: 'expected_cost' }
                    ];

                    // Add default candidate information rows
                    defaultCandidateFields.forEach(field => {
                        const row = document.createElement('tr');
                        row.className = 'candidate-row';
                        let value = candidate[field.key] || 'N/A';

                        row.innerHTML = `
                            <td class="info-label">${field.label}</td>
                            <td class="info-value">${value}</td>
                        `;
                        
                        candidateTbody.appendChild(row);
                    });

                    // Add hidden class to non-default fields
                    Object.entries(candidate).forEach(([key, value]) => {
                        if (!defaultCandidateFields.some(field => field.key === key)) {
                            const row = document.createElement('tr');
                            row.className = 'candidate-extra-row hidden'; // Add 'hidden' class
                            row.style.display = 'none';
                            row.innerHTML = `
                                <td class="info-label">${key.replace(/_/g, ' ').toUpperCase()}</td>
                                <td class="info-value">${value || 'N/A'}</td>
                            `;
                            candidateTbody.appendChild(row);
                        }
                    });

                    candidateTable.appendChild(candidateTbody);
                    candidateContainer.appendChild(candidateTable);

                    // Add candidate dropdown button
                    const candidateDropdownBtn = document.createElement('button');
                    candidateDropdownBtn.className = 'candidate-only-dropdown';
                    candidateDropdownBtn.setAttribute('data-table-id', candidateTable.id); // Add this line
                    candidateDropdownBtn.innerHTML = 'Show More Candidate Info <i class="fas fa-caret-down"></i>';
                    candidateContainer.appendChild(candidateDropdownBtn);

                    // Setup candidate dropdown functionality
                    handleCandidateDropdown(candidateContainer, candidateTable, candidateDropdownBtn);

                    companyContainer.appendChild(candidateContainer);
                });
            }

           
      
        });
    } catch (error) {
        console.error('Error:', error);
        companiesSection.innerHTML = '<p class="error-message">Failed to load data</p>';
    }
});

// Helper functions
function createCompanyTitle(company) {
    const companyName = company.företagsnamn || 'N/A';
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
    let dots = '';

    if (isRecruitment) {
        dots += '<span class="legend-dot pink" title="Recruitment Company"></span>';
    }
    if (isConsultant) {
        dots += '<span class="legend-dot black" title="Consultant Company"></span>';
    }

    return dots;
}

function createEmailLink(email) {
    if (!email || email === 'N/A') return 'N/A';
    return `
        <a href="mailto:${email}" 
           class="link email-link" 
           title="Send email to ${email}">
            <i class="fas fa-envelope"></i> ${email}
        </a>`;
}

// Add this helper function for creating clickable web links
function createWebLink(url) {
    if (!url || url === 'N/A' || url === 'none') {
        return '<span class="empty-field">No website provided</span>';
    }
    
    // Ensure URL has http/https prefix
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    return `
        <a href="${fullUrl}" 
           class="link web-link" 
           target="_blank" 
           title="Visit website">
            <i class="fas fa-globe"></i> ${url}
        </a>`;
}

function createPhoneLink(phone) {
    if (!phone || phone === 'N/A') return 'N/A';
    const cleanPhone = phone.replace(/\D/g, '');
    return `
        <a href="tel:${cleanPhone}" 
           class="link phone-link" 
           title="Call this number">
            <i class="fas fa-phone"></i> ${phone}
        </a>`;
}

// Function to handle company dropdown
function handleCompanyDropdown(companyContainer, companyTable, dropdownBtn) {
    // Select only company hidden rows from this specific table
    const companyHiddenRows = Array.from(companyTable.querySelectorAll('.company-hidden'));
    
    // Initially hide rows
    companyHiddenRows.forEach(row => {
        row.style.display = 'none';
    });

    dropdownBtn.addEventListener('click', () => {
        const isExpanded = dropdownBtn.classList.contains('active');
        dropdownBtn.classList.toggle('active');
        
        companyHiddenRows.forEach(row => {
            row.style.display = isExpanded ? 'none' : 'table-row';
        });

        dropdownBtn.innerHTML = isExpanded ? 
            'Show More Company Info <i class="fas fa-caret-down"></i>' : 
            'Show Less Company Info <i class="fas fa-caret-up"></i>';
    });
}

// Add this function to create table headers
function createTableHeader(header1, header2) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th class="info-label">${header1}</th>
        <th class="info-value">${header2}</th>
    `;
    thead.appendChild(headerRow);
    return thead;
}

// Keep only one copy of these utility functions
function setupSalaryEditor(container, originalValue, candidate, companyIndex, candidateIndex) {
    const editBtn = container.querySelector('.edit-btn');
    const editForm = container.querySelector('.edit-form');
    const input = container.querySelector('input');
    const saveBtn = container.querySelector('.save-btn');
    const cancelBtn = container.querySelector('.cancel-btn');
    const displayValue = container.querySelector('.salary-value');

    editBtn.addEventListener('click', () => {
        editBtn.parentElement.classList.add('hidden');
        editForm.classList.remove('hidden');
        input.value = originalValue;
        input.focus();
    });

    saveBtn.addEventListener('click', async () => {
        // ... salary saving logic ...
    });

    cancelBtn.addEventListener('click', () => {
        input.value = originalValue;
        editForm.classList.add('hidden');
        editBtn.parentElement.classList.remove('hidden');
    });
}

function setupEditableField(container, originalValue, fieldKey, fieldType, company, companyIndex) {
    const editBtn = container.querySelector('.edit-btn');
    const editForm = container.querySelector('.edit-form');
    const input = container.querySelector('input');
    const saveBtn = container.querySelector('.save-btn');
    const cancelBtn = container.querySelector('.cancel-btn');

    editBtn.addEventListener('click', () => {
        editBtn.classList.add('hidden'); // Changed from editBtn.parentElement
        editForm.classList.remove('hidden');
        input.value = originalValue === 'N/A' ? '' : originalValue;
        input.focus();
    });

    saveBtn.addEventListener('click', async () => {
        const newValue = input.value.trim();
        if (validateInput(newValue, fieldType)) {
            try {
                company[fieldKey] = newValue;
                const saved = await saveToJSON(company, fieldKey, companyIndex);
                
                if (saved) {
                    // Update the display
                    const emptyField = container.querySelector('.empty-field');
                    if (emptyField) {
                        if (fieldType === 'phone') {
                            container.querySelector('.empty-field').outerHTML = `
                                <a href="tel:${newValue}" class="link phone-link">
                                    <i class="fas fa-phone"></i> ${newValue}
                                </a>`;
                        } else if (fieldType === 'email') {
                            container.querySelector('.empty-field').outerHTML = `
                                <a href="mailto:${newValue}" class="link email-link">
                                    <i class="fas fa-envelope"></i> ${newValue}
                                </a>`;
                        }
                    }

                    // Hide edit form and show uneditable state
                    editForm.classList.add('hidden');
                    editBtn.classList.add('hidden');
                    const uneditable = container.querySelector(`.uneditable-${fieldType}`);
                    if (uneditable) {
                        uneditable.classList.remove('hidden');
                    }

                    // Show success message
                    const successMsg = document.createElement('div');
                    successMsg.className = 'success-message';
                    successMsg.textContent = `${fieldType} added successfully!`;
                    container.appendChild(successMsg);
                    setTimeout(() => successMsg.remove(), 2000);
                }
            } catch (error) {
                console.error('Error:', error);
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = `Failed to save ${fieldType}`;
                container.appendChild(errorMsg);
                setTimeout(() => errorMsg.remove(), 2000);
            }
        } else {
            alert(`Please enter a valid ${fieldType}`);
        }
    });

    cancelBtn.addEventListener('click', () => {
        input.value = '';
        editForm.classList.add('hidden');
        editBtn.classList.remove('hidden'); // Changed from editBtn.parentElement
    });
}

function validateInput(value, type) {
    switch (type) {
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'phone':
            return /^[\d\s\-\+]{8,}$/.test(value);
        default:
            return value.trim().length > 0;
    }
}

// Update the saveToJSON function
async function saveToJSON(data, fieldKey, companyIndex) {
    try {
        // First get the current data
        const getResponse = await fetch('./data/Companies_and_candidates.json');
        if (!getResponse.ok) throw new Error('Failed to fetch current data');
        const allData = await getResponse.json();

        // Update the specific field
        allData[companyIndex][fieldKey] = data[fieldKey];

        // Save the entire updated data
        const saveResponse = await fetch('http://localhost:3000/saveData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(allData)
        });

        if (!saveResponse.ok) {
            throw new Error('Failed to save changes');
        }

        const result = await saveResponse.json();
        return result.success;
    } catch (error) {
        console.error('Error saving to JSON:', error);
        return false;
    }
}

// Function to handle candidate dropdown
function handleCandidateDropdown(candidateContainer, candidateTable, dropdownBtn) {
    // Select only candidate hidden rows from this specific table
    const candidateHiddenRows = Array.from(candidateTable.querySelectorAll('.candidate-extra-row.hidden'));
    
    // Initially hide rows
    candidateHiddenRows.forEach(row => {
        row.style.display = 'none';
    });

    dropdownBtn.addEventListener('click', () => {
        const isExpanded = dropdownBtn.classList.contains('active');
        dropdownBtn.classList.toggle('active');
        
        candidateHiddenRows.forEach(row => {
            row.style.display = isExpanded ? 'none' : 'table-row';
        });

        dropdownBtn.innerHTML = isExpanded ? 
            'Show More Candidate Info <i class="fas fa-caret-down"></i>' : 
            'Show Less Candidate Info <i class="fas fa-caret-up"></i>';
    });
}

