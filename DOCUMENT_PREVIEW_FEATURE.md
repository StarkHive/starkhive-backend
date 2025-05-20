# Document Preview Generation for Shared Files

This feature enhances the platform by providing document preview capabilities for files shared by users. The implementation includes:

- A document processing pipeline for various file types
- Preview generation for PDF and Office documents
- Text extraction for search indexing
- Caching mechanism for generated previews
- Security scanning for uploaded documents
- Access control based on user permissions

## Architecture

The feature is implemented using several components:

1. **DocumentPreviewService**: Main service that coordinates the preview generation process.
2. **DocumentProcessorService**: Handles the document processing pipeline.
3. **PdfProcessorService**: Specializes in processing PDF files.
4. **OfficeProcessorService**: Handles Word and Excel documents.
5. **DocumentCacheService**: Caches generated previews to improve performance.
6. **DocumentSecurityService**: Performs security checks on uploaded files.
7. **DocumentPreviewController**: Exposes REST endpoints for the preview functionality.

## API Endpoints

The feature exposes the following endpoints:

- `POST /document-preview/upload`: Upload a document and generate a preview
- `GET /document-preview/:id`: Get a previously generated preview by document ID
- `GET /document-preview/:id/text`: Extract text content from a document for search indexing

## Installation

1. Install the required dependencies:

```bash
npm install pdf-parse mammoth node-xlsx file-type mime-types sanitize-filename
```

2. The module will automatically create necessary directories on startup (uploads, previews, thumbnails).

## Usage

### Uploading and Previewing a Document

```typescript
// Example using Axios
const formData = new FormData();
formData.append('file', documentFile);

const response = await axios.post('http://localhost:3000/document-preview/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const preview = response.data;
// Use preview.previewUrl to display the document preview
// Use preview.textPreview to display a text excerpt
```

### Retrieving a Preview

```typescript
const response = await axios.get(`http://localhost:3000/document-preview/${documentId}`);
const preview = response.data;
```

### Extracting Text for Search

```typescript
const response = await axios.get(`http://localhost:3000/document-preview/${documentId}/text`);
const { text } = response.data;
// Use text for search indexing
```

## Security Considerations

- Files are scanned for potential security issues before processing
- Maximum file size is limited to 50MB
- Only specific document types are allowed (PDF, Word, Excel)
- Access control is enforced for all operations

## Future Improvements

- Add support for more document types
- Implement more advanced preview rendering
- Integrate with cloud storage for scalable preview storage
- Add OCR capabilities for scanned documents
- Implement more sophisticated caching strategies