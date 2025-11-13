# PowerShell script to convert PDF files to Markdown
# Requires: Python with PyPDF2 or pdfplumber installed

Write-Host "Converting PDF files to Markdown..." -ForegroundColor Green

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Python not found. Please install Python first." -ForegroundColor Red
    exit 1
}

# Create Python script for PDF conversion
$pythonScript = @"
import os
import sys
try:
    import PyPDF2
    pdf_lib = 'PyPDF2'
except ImportError:
    try:
        import pdfplumber
        pdf_lib = 'pdfplumber'
    except ImportError:
        print("Error: Neither PyPDF2 nor pdfplumber is installed.")
        print("Please install one of them:")
        print("pip install PyPDF2")
        print("or")
        print("pip install pdfplumber")
        sys.exit(1)

def convert_pdf_to_md(pdf_path, output_path):
    text_content = ""
    
    if pdf_lib == 'PyPDF2':
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text_content += f"# Page {page_num + 1}\n\n"
                text_content += page.extract_text()
                text_content += "\n\n---\n\n"
    else:  # pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                text_content += f"# Page {page_num + 1}\n\n"
                page_text = page.extract_text()
                if page_text:
                    text_content += page_text
                text_content += "\n\n---\n\n"
    
    # Write to markdown file
    with open(output_path, 'w', encoding='utf-8') as md_file:
        md_file.write(f"# {os.path.basename(pdf_path).replace('.pdf', '')}\n\n")
        md_file.write("> Converted from PDF\n\n")
        md_file.write(text_content)
    
    print(f"Converted: {pdf_path} -> {output_path}")

# Get all PDF files in current directory
pdf_files = [f for f in os.listdir('.') if f.endswith('.pdf')]

if not pdf_files:
    print("No PDF files found in current directory.")
    sys.exit(1)

print(f"Found {len(pdf_files)} PDF file(s) to convert:")
for pdf_file in pdf_files:
    print(f"  - {pdf_file}")

# Convert each PDF
for pdf_file in pdf_files:
    md_file = pdf_file.replace('.pdf', '.md')
    try:
        convert_pdf_to_md(pdf_file, md_file)
    except Exception as e:
        print(f"Error converting {pdf_file}: {str(e)}")

print("\nConversion completed!")
"@

# Write Python script to file
$pythonScript | Out-File -FilePath "pdf_converter.py" -Encoding UTF8

# Run the Python script
Write-Host "Running PDF conversion..." -ForegroundColor Yellow
python pdf_converter.py

# Clean up
Remove-Item "pdf_converter.py" -ErrorAction SilentlyContinue

Write-Host "PDF to Markdown conversion completed!" -ForegroundColor Green
