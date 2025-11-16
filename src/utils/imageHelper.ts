/**
 * Helper function to resolve image paths for GitHub Pages deployment
 * Prepends the BASE_URL (e.g., /mascle_website/) to image paths
 */
export const getImagePath = (path: string): string => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // If path already starts with http, return as-is (external URL)
  if (path.startsWith('http')) {
    return path;
  }
  
  // Always ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // If BASE_URL is /, just return the normalized path
  if (baseUrl === '/') {
    return normalizedPath;
  }
  
  // Otherwise, combine BASE_URL with the normalized path
  // Remove trailing slash from baseUrl if present, then add normalizedPath
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBase}${normalizedPath}`;
};
