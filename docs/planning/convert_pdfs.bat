@echo off
REM Batch script to convert PDF files to Markdown
REM Requires Python with PyPDF2 or pdfplumber installed

echo Converting PDF files to Markdown...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Python not found. Please install Python first.
    pause
    exit /b 1
)

echo Python found. Installing required packages...

REM Install PyPDF2 if not available
pip install PyPDF2

echo Running PDF conversion...
python pdf_to_md_converter.py

echo.
echo PDF to Markdown conversion completed!
pause
