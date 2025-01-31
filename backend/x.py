import os

def print_dir_structure(path):
    for root, dirs, files in os.walk(path):
        level = root.replace(path, '').count(os.sep)
        indent = ' ' * 4 * level
        print(f"{indent}[{os.path.basename(root)}]")
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            print(f"{subindent}{f}")

print_dir_structure(r'C:\Users\prabh\Desktop\Elderly Financial Scams\mvp\backend')
