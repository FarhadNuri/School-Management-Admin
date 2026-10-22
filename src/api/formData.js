/**
 * Helper to build FormData for multipart requests.
 * - Files (File or Blob) are appended directly with their field name.
 * - Objects and arrays are stringified with JSON.stringify.
 * - Null / undefined are omitted unless preserveNull is true.
 * - Primitives are converted to string.
 */
export function buildFormData(fields = {}, fileFields = {}) {
  const fd = new FormData();

  // Append standard fields
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File || value instanceof Blob) {
      fd.append(key, value);
    } else if (typeof value === 'object') {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  });

  // Append dedicated file fields if passed separately
  Object.entries(fileFields).forEach(([key, file]) => {
    if (file instanceof File || file instanceof Blob) {
      fd.append(key, file);
    }
  });

  return fd;
}
