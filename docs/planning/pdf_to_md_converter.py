#!/usr/bin/env python3
"""
PDF to Markdown Converter
Converts PDF files in the current directory to Markdown format
"""

import os
import sys
import argparse

def install_requirements():
    """Install required packages if not available"""
    try:
        import PyPDF2
        return 'PyPDF2'
    except ImportError:
        try:
            import pdfplumber
            return 'pdfplumber'
        except ImportError:
            print("Error: Neither PyPDF2 nor pdfplumber is installed.")
            print("Installing PyPDF2...")
            os.system("pip install PyPDF2")
            try:
                import PyPDF2
                return 'PyPDF2'
            except ImportError:
                print("Failed to install PyPDF2. Please install manually:")
                print("pip install PyPDF2")
                sys.exit(1)

def convert_pdf_to_md(pdf_path, output_path, pdf_lib):
    """Convert a PDF file to Markdown format"""
    text_content = ""
    
    try:
        if pdf_lib == 'PyPDF2':
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text_content += f"# Page {page_num + 1}\n\n"
                    text_content += page.extract_text()
                    text_content += "\n\n---\n\n"
        else:  # pdfplumber
            import pdfplumber
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
        
        print(f"✅ Converted: {pdf_path} -> {output_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error converting {pdf_path}: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Convert PDF files to Markdown')
    parser.add_argument('--input', '-i', help='Specific PDF file to convert')
    parser.add_argument('--output', '-o', help='Output directory (default: current directory)')
    args = parser.parse_args()
    
    # Install requirements
    pdf_lib = install_requirements()
    print(f"Using PDF library: {pdf_lib}")
    
    # Determine output directory
    output_dir = args.output or '.'
    
    # Get PDF files to convert
    if args.input:
        if not os.path.exists(args.input):
            print(f"Error: File {args.input} not found.")
            sys.exit(1)
        pdf_files = [args.input]
    else:
        pdf_files = [f for f in os.listdir('.') if f.endswith('.pdf')]
    
    if not pdf_files:
        print("No PDF files found in current directory.")
        sys.exit(1)
    
    print(f"Found {len(pdf_files)} PDF file(s) to convert:")
    for pdf_file in pdf_files:
        print(f"  📄 {pdf_file}")
    
    print("\nStarting conversion...")
    
    # Convert each PDF
    success_count = 0
    for pdf_file in pdf_files:
        md_file = os.path.join(output_dir, pdf_file.replace('.pdf', '.md'))
        if convert_pdf_to_md(pdf_file, md_file, pdf_lib):
            success_count += 1
    
    print(f"\n🎉 Conversion completed! {success_count}/{len(pdf_files)} files converted successfully.")

if __name__ == "__main__":
    main()
