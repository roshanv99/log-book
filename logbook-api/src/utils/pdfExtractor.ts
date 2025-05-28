import pdfParse from 'pdf-parse';

interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: {
        PDFFormatVersion: string;
        IsAcroFormPresent: boolean;
        IsXFAPresent: boolean;
        [key: string]: any;
    };
    metadata: any;
    version: string;
}

/**
 * Extracts text content from a PDF file
 * @param pdfBuffer - The PDF file as a buffer
 * @returns Promise containing the extracted text content
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
        const options = {
            pagerender: function(pageData: any) {
                // Custom renderer to preserve line breaks and spacing
                let render_options = {
                    normalizeWhitespace: false,
                    disableCombineTextItems: false
                };
                return pageData.getTextContent(render_options)
                    .then(function(textContent: any) {
                        let lastY, text = '';
                        for (let item of textContent.items) {
                            if (lastY != item.transform[5] && text) {
                                text += '\n';
                            }
                            text += item.str;
                            lastY = item.transform[5];
                        }
                        return text;
                    });
            }
        };

        const data: PDFData = await pdfParse(pdfBuffer, options);
        console.log('PDF Info:', {
            pages: data.numpages,
            format: data.info.PDFFormatVersion,
            isAcroForm: data.info.IsAcroFormPresent,
            isXFA: data.info.IsXFAPresent
        });
        console.log('Extracted text length:', data.text.length);
        return data.text;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
} 