const codeMessage = {

  100: 'Continue: The server has received the request headers, and the client should proceed to send the request body.',
  101: 'Switching Protocols: The requester has asked the server to switch protocols.',
  102: 'Processing: WebDAV - The server has received and is processing the request, but no response is available yet.',
  103: 'Early Hints: The server is likely to send the final response with the headers included in the informational response.',


  200: 'OK: The server successfully returned the requested data.',
  201: 'Created: Data created or modified successfully.',
  202: 'Accepted: The request has been accepted for processing, but the processing has not been completed.',
  203: 'Non-Authoritative Information: The returned meta-information is from a local or third-party copy.',
  204: 'No Content: Request processed successfully, but no content is returned.',
  205: 'Reset Content: Request processed successfully, please reset the view.',
  206: 'Partial Content: The server is delivering only part of the resource due to a range header sent by the client.',


  300: 'Multiple Choices: The requested resource has multiple options for the client to follow.',
  301: 'Moved Permanently: The requested resource has been permanently moved to a new URL.',
  302: 'Found: The requested resource is temporarily located at a different URL.',
  303: 'See Other: The response can be found under another URI using the GET method.',
  304: 'Not Modified: The resource has not been modified since the version specified by request headers.',
  307: 'Temporary Redirect: The resource is temporarily located at a different URL, request method should not change.',
  308: 'Permanent Redirect: The resource is permanently located at a different URL, request method should not change.',


  400: 'Bad Request: The request was invalid, and the server could not process it.',
  401: 'Unauthorized: Authentication is required or has failed.',
  403: 'Forbidden: The server understood the request but refuses to authorize it.',
  404: 'Not Found: The requested resource could not be found.',
  405: 'Method Not Allowed: The request method is not supported for the requested resource.',
  406: 'Not Acceptable: The requested format is not supported.',
  407: 'Proxy Authentication Required: The client must authenticate with a proxy.',
  408: 'Request Timeout: The server timed out waiting for the request.',
  409: 'Conflict: The request conflicts with the current state of the server.',
  410: 'Gone: The requested resource is no longer available and will not be available again.',
  411: 'Length Required: The request did not specify the length of its content.',
  412: 'Precondition Failed: One or more conditions in the request header fields evaluated to false.',
  413: 'Payload Too Large: The request is larger than the server is willing or able to process.',
  414: 'URI Too Long: The URI provided was too long for the server to process.',
  415: 'Unsupported Media Type: The request entity has a media type which the server does not support.',
  416: 'Range Not Satisfiable: The requested range is not available for the resource.',
  417: 'Expectation Failed: The expectation given in the request could not be met by the server.',
  418: "I'm a teapot: Defined in RFC 2324, this code was an April Fools' joke.",
  421: 'Misdirected Request: The request was directed at a server that is not able to produce a response.',
  422: 'Unprocessable Entity: The request was well-formed but could not be followed due to semantic errors.',
  423: 'Locked: The resource is locked.',
  424: 'Failed Dependency: The request failed because it depended on another request and that request failed.',
  425: 'Too Early: Indicates that the server is unwilling to risk processing a request that might be replayed.',
  426: 'Upgrade Required: The client should switch to a different protocol.',
  428: 'Precondition Required: The server requires the request to be conditional.',
  429: 'Too Many Requests: The user has sent too many requests in a given amount of time.',
  431: 'Request Header Fields Too Large: The server is unwilling to process the request because its header fields are too large.',
  451: 'Unavailable For Legal Reasons: The resource is unavailable due to legal demands.',


  500: 'Internal Server Error: The server encountered an unexpected condition.',
  501: 'Not Implemented: The server does not support the functionality required to fulfill the request.',
  502: 'Bad Gateway: The server received an invalid response from the upstream server.',
  503: 'Service Unavailable: The server is currently unavailable (overloaded or down).',
  504: 'Gateway Timeout: The upstream server failed to send a request in time.',
  505: 'HTTP Version Not Supported: The server does not support the HTTP protocol version used in the request.',
  506: 'Variant Also Negotiates: Transparent content negotiation for the request results in a circular reference.',
  507: 'Insufficient Storage: The server is unable to store the representation needed to complete the request.',
  508: 'Loop Detected: The server detected an infinite loop while processing the request.',
  510: 'Not Extended: Further extensions to the request are required for the server to fulfill it.',
  511: 'Network Authentication Required: The client needs to authenticate to gain network access.'
};

export default codeMessage;