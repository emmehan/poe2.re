import requests
from bs4 import BeautifulSoup
import json
import sys

DEFAULT_URL = "https://poe2db.tw/us/Waystones#WaystonesMods"

def parse_tables_to_json(url):
    total_entries = 0
    valid_entries = 0
    
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Error requesting url: {response.status_code}")
        return
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    tables = soup.find_all('table')
    
    if not tables:
        print("No tables found in page")
        return
    
    for index, table in enumerate(tables, start=1):
        rows = table.find_all('tr')
        
        headers = rows[0].find_all(['th', 'td'])
        header_texts = [header.get_text(strip=True) for header in headers]
        
        required_headers = {'Level', 'Pre/Suf', 'Description'}
        if required_headers.issubset(header_texts):
            table_data = []
            
            # Skip header row
            for entry_index, row in enumerate(rows[1:], start=1):
                
                cells = row.find_all(['td', 'th'])
                cell_data = [cell.get_text(strip=True) for cell in cells]
                
                description_index = header_texts.index('Description')
                description_cell = cells[description_index]
                description_text = str(description_cell).strip()
                
                total_entries += 1

                description_text = BeautifulSoup(description_text, 'html.parser')

                # Extract text and seperate entries by either <br> or </br>
                description_text_str = str(description_text)
                description_text_str = description_text_str.replace('<br>', '|||').replace('<br/>', '|||')

                # Create seperate entries containing joined text
                descriptions = description_text_str.split('|||')
                descriptions = [desc.strip() for desc in descriptions if desc.strip()]

                # Remove <span> tags but preserve text in between
                descriptions = [BeautifulSoup(desc, 'html.parser') for desc in descriptions]
                for i, desc in enumerate(descriptions):
                    for span in desc.find_all('span'):
                        span.unwrap()
                    descriptions[i] = desc.get_text()

                if not descriptions:
                    continue

                # Build final entry
                row_dict = {header: value for header, value in zip(header_texts, cell_data)}
                row_dict['Description'] = descriptions
                
                table_data.append(row_dict)
                
                valid_entries += 1
            
            output_file = 'table_waystone_modifier.json'
            with open(output_file, mode='w', encoding='utf-8') as file:
                json.dump(table_data, file, ensure_ascii=False, indent=4)
            
            print(f"\nTable #{index} was saved to '{output_file}'.")
    
    print(f"\n{total_entries} entries were parsed from table.")
    print(f"{valid_entries} were save to JSON file.")
    
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python parse_waystone.py <URL>")
        print(f"Using default URL: {DEFAULT_URL}")
        parse_tables_to_json(DEFAULT_URL)
    else:
        url = sys.argv[1]
        parse_tables_to_json(url)
