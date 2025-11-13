#!/usr/bin/env python3
"""
Simple PDF to Markdown Converter
"""

import os
import sys

def convert_pdf_to_md(pdf_path, output_path):
    """Convert a PDF file to Markdown format using PyPDF2"""
    try:
        import PyPDF2
        
        text_content = ""
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text_content += f"# Page {page_num + 1}\n\n"
                text_content += page.extract_text()
                text_content += "\n\n---\n\n"
        
        # Write to markdown file
        with open(output_path, 'w', encoding='utf-8') as md_file:
            md_file.write(f"# {os.path.basename(pdf_path).replace('.pdf', '')}\n\n")
            md_file.write("> Converted from PDF\n\n")
            md_file.write(text_content)
        
        print(f"✅ Converted: {pdf_path} -> {output_path}")
        return True
        
    except ImportError:
        print("❌ PyPDF2 not installed. Installing...")
        os.system("pip install PyPDF2")
        return convert_pdf_to_md(pdf_path, output_path)  # Try again
    except Exception as e:
        print(f"❌ Error converting {pdf_path}: {str(e)}")
        return False

def main():
    print("PDF to Markdown Converter")
    print("=" * 30)
    
    # Get all PDF files in current directory
    pdf_files = [f for f in os.listdir('.') if f.endswith('.pdf')]
    
    if not pdf_files:
        print("No PDF files found in current directory.")
        return
    
    print(f"Found {len(pdf_files)} PDF file(s) to convert:")
    for pdf_file in pdf_files:
        print(f"  📄 {pdf_file}")
    
    print("\nStarting conversion...")
    
    # Convert each PDF
    success_count = 0
    for pdf_file in pdf_files:
        md_file = pdf_file.replace('.pdf', '.md')
        if convert_pdf_to_md(pdf_file, md_file):
            success_count += 1
    
    print(f"\n🎉 Conversion completed! {success_count}/{len(pdf_files)} files converted successfully.")

if __name__ == "__main__":
    main()

