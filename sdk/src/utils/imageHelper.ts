/**
 * Image Helper Utilities
 * Provides utilities for handling image data, including blob URL detection
 * and validation of image inputs.
 */

export interface ImageValidationResult {
    isValid: boolean;
    isBlobUrl: boolean;
    isBase64: boolean;
    isHttpUrl: boolean;
    error?: string;
    guidance?: string;
}

/**
 * Validates an image input and provides guidance if it's a blob URL
 */
export function validateImageInput(input: string): ImageValidationResult {
    // Check if it's a blob URL
    if (input.startsWith('blob:')) {
        return {
            isValid: false,
            isBlobUrl: true,
            isBase64: false,
            isHttpUrl: false,
            error: 'Blob URLs cannot be accessed from Node.js server',
            guidance: `
Blob URLs are browser-specific memory references and cannot be accessed from a Node.js server.

To fix this, convert the blob to base64 in your client code:

**JavaScript/TypeScript:**
\`\`\`javascript
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Extract base64 data (remove data:image/png;base64, prefix)
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Usage:
const blob = await fetch(blobUrl).then(r => r.blob());
const base64Data = await blobToBase64(blob);

// Send imageData instead of imageUrl:
{
  type: 'image',
  imageData: base64Data  // ✅ Send base64 data
}
\`\`\`

**React Example:**
\`\`\`javascript
const handleImageUpload = async (file) => {
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });

  // Use base64 in your message
  setMessage({
    ...message,
    content: [
      { type: 'text', text: 'Process this image' },
      { type: 'image', imageData: base64 }
    ]
  });
};
\`\`\`
`
        };
    }

    // Check if it's base64 data
    if (input.startsWith('data:image/')) {
        return {
            isValid: true,
            isBlobUrl: false,
            isBase64: true,
            isHttpUrl: false
        };
    }

    // Check if it's an HTTP/HTTPS URL
    if (input.startsWith('http://') || input.startsWith('https://')) {
        return {
            isValid: true,
            isBlobUrl: false,
            isBase64: false,
            isHttpUrl: true
        };
    }

    // Check if it's raw base64 (no data URL prefix)
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    if (base64Regex.test(input.substring(0, 100))) {
        return {
            isValid: true,
            isBlobUrl: false,
            isBase64: true,
            isHttpUrl: false
        };
    }

    return {
        isValid: false,
        isBlobUrl: false,
        isBase64: false,
        isHttpUrl: false,
        error: 'Unknown image format. Expected HTTP URL, base64 data, or data URL.'
    };
}

/**
 * Extracts base64 data from a data URL
 * e.g., "data:image/png;base64,iVBORw0..." -> "iVBORw0..."
 */
export function extractBase64FromDataUrl(dataUrl: string): string {
    if (dataUrl.startsWith('data:')) {
        const base64Index = dataUrl.indexOf('base64,');
        if (base64Index !== -1) {
            return dataUrl.substring(base64Index + 7);
        }
    }
    return dataUrl;
}

/**
 * Checks if a string is likely base64 encoded data
 */
export function isBase64(str: string): boolean {
    if (!str || str.length < 10) return false;

    // Check if it's a data URL
    if (str.startsWith('data:')) return true;

    // Check if it matches base64 pattern
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    return base64Regex.test(str.substring(0, 100));
}

/**
 * Gets the MIME type from a data URL
 */
export function getMimeTypeFromDataUrl(dataUrl: string): string | null {
    if (!dataUrl.startsWith('data:')) return null;

    const mimeMatch = dataUrl.match(/data:([^;]+);/);
    return mimeMatch ? mimeMatch[1] : null;
}

/**
 * Converts a base64 string to a Buffer
 */
export function base64ToBuffer(base64: string): Buffer {
    // Remove data URL prefix if present
    const cleanBase64 = extractBase64FromDataUrl(base64);
    return Buffer.from(cleanBase64, 'base64');
}

/**
 * Client-side code snippet for converting blob to base64
 * This can be sent to clients as documentation
 */
export const CLIENT_BLOB_CONVERSION_SNIPPET = `
// Client-side utility to convert blob URL to base64
async function convertBlobToBase64(blobUrl) {
  try {
    // Fetch the blob data
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    // Convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extract base64 data (remove data URL prefix)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting blob to base64:', error);
    throw error;
  }
}

// Usage example:
const blobUrl = 'blob:https://example.com/...';
const base64Data = await convertBlobToBase64(blobUrl);

// Send in your API request:
const message = {
  type: 'image',
  imageData: base64Data  // ✅ Use imageData, not imageUrl
};
`;
