import re
import json
import os
from colorama import init, Fore, Style
from tabulate import tabulate

def read_menu_data(file_path):
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        absolute_path = os.path.join(current_dir, 'script.js')
        
        print(f"Trying to read file from: {absolute_path}")
        
        with open(absolute_path, 'r', encoding='utf-8') as file:
            content = file.read()
            
            # Find the menuData object
            start_index = content.find('const menuData = {')
            if start_index == -1:
                raise ValueError("Could not find menuData in script.js")
            
            # Extract just the menuData object
            content = content[start_index:]
            end_index = content.find('let cart = [];')
            if end_index == -1:
                end_index = content.find('};') + 2  # Include the semicolon
            
            menu_section = content[len('const menuData = '):end_index]
            
            # Clean up JavaScript syntax
            menu_section = menu_section.strip().rstrip(';')
            menu_section = re.sub(r'//.*?\n', '\n', menu_section)  # Remove single-line comments
            menu_section = re.sub(r'/\*.*?\*/', '', menu_section, flags=re.DOTALL)  # Remove multi-line comments
            
            # Fix property names and values
            menu_section = re.sub(r'(\w+):', r'"\1":', menu_section)  # Quote property names
            menu_section = menu_section.replace('true', 'true').replace('false', 'false')
            menu_section = menu_section.replace('null', 'null')
            
            # Try parsing as JSON first
            try:
                menu_data = json.loads(menu_section)
                return menu_data
            except json.JSONDecodeError as je:
                print(f"JSON parsing failed: {je}")
                
                # Additional cleanup for another attempt
                menu_section = re.sub(r',(\s*[}\]])', r'\1', menu_section)  # Remove trailing commas
                menu_section = re.sub(r':\s*undefined\b', ': null', menu_section)  # Replace undefined with null
                
                try:
                    menu_data = json.loads(menu_section)
                    return menu_data
                except json.JSONDecodeError as je2:
                    print(f"Second JSON parsing attempt failed: {je2}")
                    print("Menu section causing error:")
                    print(menu_section[:200] + "...")  # Print first 200 chars for debugging
                    return None
            
    except Exception as e:
        print(f"Error reading menu data: {e}")
        print(f"Current working directory: {os.getcwd()}")
        return None

def save_menu_data(menu_data):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'script.js')
    
    try:
        # Convert Python dict to JavaScript format
        menu_str = json.dumps(menu_data, indent=2)
        menu_str = menu_str.replace('true', 'true').replace('false', 'false').replace('null', 'null')
        
        # Read existing file content
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Find menuData section and replace it
        start_index = content.find('const menuData = ')
        end_index = content.find('let cart = [];')
        
        if start_index == -1 or end_index == -1:
            raise ValueError("Could not find menuData section in script.js")
        
        new_content = (
            content[:start_index] +
            'const menuData = ' + menu_str + ';\n\n' +
            content[end_index:]
        )
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
            
        print(f"{Fore.GREEN}Menu data saved successfully!{Style.RESET_ALL}")
        
    except Exception as e:
        print(f"{Fore.RED}Error saving menu data: {e}{Style.RESET_ALL}")

def add_menu_item(menu_data):
    print(f"\n{Fore.CYAN}Add New Menu Item{Style.RESET_ALL}")
    
    # Select category
    categories = list(menu_data.keys())
    print("\nAvailable categories:")
    for i, category in enumerate(categories, 1):
        print(f"{i}. {category}")
    
    category_idx = int(input("\nSelect category (number): ")) - 1
    category = categories[category_idx]
    
    # Get item details
    item = {
        'name': input("Enter item name: "),
        'image': input("Enter image path: ")
    }
    
    if category == "Drinks":
        item['price'] = float(input("Enter price: "))
        item['details'] = {
            'volume': input("Enter volume: "),
            'type': input("Enter type: "),
            'ingredients': input("Enter ingredients (comma-separated): ").split(','),
            'nutritionInfo': {
                'calories': input("Enter calories: "),
                'sugar': input("Enter sugar content: ")
            },
            'tags': input("Enter tags (comma-separated): ").split(',')
        }
    else:
        price_type = input("Single price or multiple sizes? (s/m): ").lower()
        if price_type == 's':
            item['price'] = float(input("Enter price: "))
        else:
            sizes = input("Enter sizes (comma-separated): ").split(',')
            item['price'] = {}
            for size in sizes:
                item['price'][size.strip()] = float(input(f"Enter price for {size}: "))
    
    menu_data[category].append(item)
    print(f"{Fore.GREEN}Item added successfully!{Style.RESET_ALL}")

def modify_menu_item(menu_data):
    print(f"\n{Fore.CYAN}Modify Menu Item{Style.RESET_ALL}")
    
    # Select category and item
    category = select_category(menu_data)
    item_idx = select_item(menu_data[category])
    item = menu_data[category][item_idx]
    
    print("\nCurrent item details:")
    print(json.dumps(item, indent=2))
    
    # Modify fields
    item['name'] = input("Enter new name (or press Enter to keep current): ") or item['name']
    item['image'] = input("Enter new image path (or press Enter to keep current): ") or item['image']
    
    if isinstance(item['price'], dict):
        for size in item['price'].keys():
            new_price = input(f"Enter new price for {size} (or press Enter to keep current): ")
            if new_price:
                item['price'][size] = float(new_price)
    else:
        new_price = input("Enter new price (or press Enter to keep current): ")
        if new_price:
            item['price'] = float(new_price)
    
    print(f"{Fore.GREEN}Item modified successfully!{Style.RESET_ALL}")

def delete_menu_item(menu_data):
    print(f"\n{Fore.CYAN}Delete Menu Item{Style.RESET_ALL}")
    
    # Select category and item
    category = select_category(menu_data)
    item_idx = select_item(menu_data[category])
    
    # Confirm deletion
    item = menu_data[category][item_idx]
    print(f"\nAre you sure you want to delete '{item['name']}'?")
    if input("Type 'yes' to confirm: ").lower() == 'yes':
        menu_data[category].pop(item_idx)
        print(f"{Fore.GREEN}Item deleted successfully!{Style.RESET_ALL}")
    else:
        print(f"{Fore.YELLOW}Deletion cancelled.{Style.RESET_ALL}")

def select_category(menu_data):
    categories = list(menu_data.keys())
    print("\nSelect category:")
    for i, category in enumerate(categories, 1):
        print(f"{i}. {category}")
    category_idx = int(input("\nEnter number: ")) - 1
    return categories[category_idx]

def select_item(items):
    print("\nSelect item:")
    for i, item in enumerate(items, 1):
        print(f"{i}. {item['name']}")
    return int(input("\nEnter number: ")) - 1

def display_menu_category(category_name, items):
    print(f"\n{Fore.CYAN}{'='*80}")
    print(f"{Fore.GREEN}{Style.BRIGHT}{category_name}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*80}{Style.RESET_ALL}\n")
    
    if category_name == "Drinks":
        display_drinks(items)
    else:
        display_regular_items(items)

def display_regular_items(items):
    table_data = []
    for item in items:
        name = item['name']
        price = item['price']
        image = item['image']
        
        if isinstance(price, dict):
            price_str = ' | '.join([f"{size}: ${price[size]:.2f}" for size in price])
        else:
            price_str = f"${price:.2f}"
            
        table_data.append([name, price_str, image])
    
    print(tabulate(table_data, headers=['Item Name', 'Price', 'Image Path'], 
                  tablefmt='fancy_grid', numalign='left'))

def display_drinks(items):
    for item in items:
        print(f"\n{Fore.YELLOW}{Style.BRIGHT}{item['name']}{Style.RESET_ALL}")
        print(f"Price: ${item['price']:.2f}")
        print(f"Image: {item['image']}")
        
        if 'details' in item:
            details = item['details']
            print(f"{Fore.CYAN}Details:{Style.RESET_ALL}")
            print(f"  Volume: {details.get('volume', 'N/A')}")
            print(f"  Type: {details.get('type', 'N/A')}")
            
            if 'ingredients' in details:
                print(f"  Ingredients: {', '.join(details['ingredients'])}")
            
            if 'nutritionInfo' in details:
                print(f"  Nutrition Info:")
                for key, value in details['nutritionInfo'].items():
                    print(f"    - {key}: {value}")
            
            if 'tags' in details:
                print(f"  Tags: {', '.join(details['tags'])}")
        print(f"{Fore.CYAN}{'-'*40}{Style.RESET_ALL}")

def main():
    init()  # Initialize colorama
    
    try:
        menu_data = read_menu_data('script.js')
        
        if menu_data:
            while True:
                print(f"\n{Fore.MAGENTA}{Style.BRIGHT}Menu Management System{Style.RESET_ALL}")
                print(f"\n{Fore.YELLOW}Options:{Style.RESET_ALL}")
                print("1. View Menu")
                print("2. Add Item")
                print("3. Modify Item")
                print("4. Delete Item")
                print("5. Save Changes")
                print("6. Exit")
                
                choice = input("\nEnter your choice (1-6): ")
                
                if choice == '1':
                    for category, items in menu_data.items():
                        display_menu_category(category, items)
                elif choice == '2':
                    add_menu_item(menu_data)
                elif choice == '3':
                    modify_menu_item(menu_data)
                elif choice == '4':
                    delete_menu_item(menu_data)
                elif choice == '5':
                    save_menu_data(menu_data)
                elif choice == '6':
                    break
                else:
                    print(f"{Fore.RED}Invalid choice. Please try again.{Style.RESET_ALL}")
        else:
            print(f"{Fore.RED}Failed to read menu data{Style.RESET_ALL}")
            
    except Exception as e:
        print(f"{Fore.RED}Error in main: {e}{Style.RESET_ALL}")
    finally:
        print(f"\n{Fore.GREEN}Press Enter to exit...{Style.RESET_ALL}")
        input()

if __name__ == "__main__":
    main()