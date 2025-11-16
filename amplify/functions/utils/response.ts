/**
 * Creates a standardized API response with consistent headers and formatting
 * @param statusCode HTTP status code
 * @param body Response body (will be JSON stringified)
 * @param additionalHeaders Optional additional headers to include
 * @returns Formatted API Gateway response
 */
export function createResponse(
  statusCode: number, 
  body: Record<string, unknown>, 
  additionalHeaders: Record<string, string> = {}
) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,Cache-Control,X-Api-Key,X-Amz-Date,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
      'Access-Control-Max-Age': '86400', // 24 hours
      ...additionalHeaders
    },
    body: JSON.stringify(body)
  };
}

/**
 * Creates a success response (200 OK)
 * @param data Response data
 * @param additionalHeaders Optional additional headers
 */
export function createSuccessResponse(data: Record<string, unknown>, additionalHeaders = {}) {
  return createResponse(200, data, additionalHeaders);
}

/**
 * Creates an error response
 * @param statusCode HTTP error status code
 * @param message Error message
 * @param additionalHeaders Optional additional headers
 */
export function createErrorResponse(statusCode: number, message: string, additionalHeaders = {}) {
  return createResponse(statusCode, { error: message }, additionalHeaders);
} 