import json
import os
import sys
from pathlib import Path
from math import ceil

def split_json_files(page_size=50):
    try:
        # Get absolute paths
        base_dir = Path.cwd()
        input_file = base_dir / 'public' / 'Companies_and_candidates.json'
        companies_dir = base_dir / 'public' / 'companies'
        candidates_dir = base_dir / 'public' / 'candidates'

        print(f"Working directory: {base_dir}")
        print(f"Reading input file: {input_file}")
        
        # Read and parse JSON
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Calculate total pages needed
        total_companies = len(data)
        total_pages = ceil(total_companies / page_size)
        
        print(f"Total companies: {total_companies}")
        print(f"Page size: {page_size}")
        print(f"Total pages: {total_pages}")

        # Create directories if they don't exist
        companies_dir.mkdir(parents=True, exist_ok=True)
        candidates_dir.mkdir(parents=True, exist_ok=True)

        # Create metadata file with pagination info
        metadata = {
            "totalCompanies": total_companies,
            "pageSize": page_size,
            "totalPages": total_pages
        }
        
        with open(companies_dir / 'metadata.json', 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

        # Split companies into pages
        for page in range(total_pages):
            start_idx = page * page_size
            end_idx = min((page + 1) * page_size, total_companies)
            
            # Process companies for this page
            companies_page = []
            for idx in range(start_idx, end_idx):
                company = data[idx]
                company_info = {
                    'id': idx,
                    'företagsnamn': company.get('företagsnamn', ''),
                    'företagswebb': company.get('företagswebb', ''),
                    'organisationsnummer': company.get('organisationsnummer', ''),
                    'sökterm': company.get('sökterm', []),
                    'annons_url': company.get('annons_url', ''),
                    'titel': company.get('titel', ''),
                    'beskrivning': company.get('beskrivning', ''),
                    'Techstack': company.get('Techstack', ''),
                    'Produkt': company.get('Produkt', ''),
                    'Företagsstruktur': company.get('Företagsstruktur', ''),
                    'Ekonomi': company.get('Ekonomi', ''),
                    'Ekonomisiffor': company.get('Ekonomisiffor', {}),
                    'kontakter': company.get('kontakter', []),
                    'social_links': company.get('social_links', {}),
                    'recruitmentcompany': company.get('recruitmentcompany', False),
                    'consultantcompany': company.get('consultantcompany', False)
                }
                companies_page.append(company_info)

                # Save candidates if they exist
                if 'matched_candidates' in company and company['matched_candidates']:
                    candidates_file = candidates_dir / f'company_{idx}.json'
                    print(f"Saving candidates for company {idx} to: {candidates_file}")
                    with open(candidates_file, 'w', encoding='utf-8') as f:
                        json.dump(company['matched_candidates'], f, indent=2, ensure_ascii=False)

            # Save this page of companies
            page_file = companies_dir / f'page_{page + 1}.json'
            print(f"Saving companies page {page + 1} to: {page_file}")
            with open(page_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "page": page + 1,
                    "totalPages": total_pages,
                    "pageSize": page_size,
                    "companies": companies_page
                }, f, indent=2, ensure_ascii=False)

        print("\nSplit completed successfully:")
        print(f"- Companies directory: {companies_dir}")
        print(f"- Candidates directory: {candidates_dir}")
        print(f"- Total pages created: {total_pages}")

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        raise

if __name__ == "__main__":
    split_json_files(page_size=50)  # You can adjust the page size here