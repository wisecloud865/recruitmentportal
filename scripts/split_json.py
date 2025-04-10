import json
import os
import sys
from pathlib import Path

def split_json_files():
    try:
        # Get absolute paths
        base_dir = Path.cwd()
        input_file = base_dir / 'public' / 'Companies_and_candidates.json'
        companies_file = base_dir / 'public' / 'companies.json'
        candidates_dir = base_dir / 'public' / 'candidates'

        print(f"Working directory: {base_dir}")
        print(f"Reading input file: {input_file}")
        
        # Read and parse JSON
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Extract company information (excluding candidates)
        companies = []
        for idx, company in enumerate(data):
            # Create company object with all fields except matched_candidates
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
            companies.append(company_info)

        # Save companies.json
        print(f"Saving companies data to: {companies_file}")
        with open(companies_file, 'w', encoding='utf-8') as f:
            json.dump(companies, f, indent=2, ensure_ascii=False)

        # Create and save candidate files
        candidates_dir.mkdir(parents=True, exist_ok=True)
        for idx, company in enumerate(data):
            if 'matched_candidates' in company and company['matched_candidates']:
                candidates_file = candidates_dir / f'company_{idx}.json'
                print(f"Saving candidates for company {idx} to: {candidates_file}")
                with open(candidates_file, 'w', encoding='utf-8') as f:
                    json.dump(company['matched_candidates'], f, indent=2, ensure_ascii=False)

        print("\nSplit completed successfully:")
        print(f"- Companies file: {companies_file}")
        print(f"- Candidates directory: {candidates_dir}")

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        raise

if __name__ == "__main__":
    split_json_files()