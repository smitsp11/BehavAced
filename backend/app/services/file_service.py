"""
File Processing Service - Handles resume parsing
"""
import base64
from typing import Optional
import PyPDF2
import docx
import io


class FileService:
    """Service for processing uploaded files"""
    
    @staticmethod
    def decode_base64_file(file_content: str) -> bytes:
        """Decode base64 encoded file content"""
        return base64.b64decode(file_content)
    
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_file = io.BytesIO(file_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            raise ValueError(f"Error parsing PDF: {str(e)}")
    
    @staticmethod
    def extract_text_from_docx(file_bytes: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            doc_file = io.BytesIO(file_bytes)
            doc = docx.Document(doc_file)
            
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            return text.strip()
        except Exception as e:
            raise ValueError(f"Error parsing DOCX: {str(e)}")
    
    @staticmethod
    def extract_text_from_txt(file_bytes: bytes) -> str:
        """Extract text from TXT file"""
        try:
            return file_bytes.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Error parsing TXT: {str(e)}")
    
    def process_resume(self, file_content: str, file_type: str) -> str:
        """Process resume file and extract text"""
        
        # Decode base64 content
        file_bytes = self.decode_base64_file(file_content)
        
        # Extract text based on file type
        if file_type.lower() == 'pdf':
            return self.extract_text_from_pdf(file_bytes)
        elif file_type.lower() in ['docx', 'doc']:
            return self.extract_text_from_docx(file_bytes)
        elif file_type.lower() == 'txt':
            return self.extract_text_from_txt(file_bytes)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")


# Global instance
file_service = FileService()

