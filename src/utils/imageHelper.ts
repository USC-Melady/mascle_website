/**
 * Helper function to resolve image paths for GitHub Pages deployment
 * Prepends the BASE_URL (e.g., /mascle_website/) to image paths
 */
export const getImagePath = (path: string): string => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // If path already starts with the base URL or is absolute, return as-is
  if (path.startsWith(baseUrl) || path.startsWith('http')) {
    return path;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine base URL with path
  return `${baseUrl}${cleanPath}`;
};
