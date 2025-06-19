import { spawn } from 'child_process';
import { PassThrough } from 'stream';
import { ApiError } from './ApiError.js';

/**
 * Securely spawns a process with streaming input/output
 * Uses spawn() instead of exec() for security and performance
 * @param {string} command - The command to execute
 * @param {string[]} args - Array of arguments (no shell interpretation)
 * @param {Object} options - Spawn options
 * @returns {Promise<{stdin: PassThrough, stdout: PassThrough, stderr: PassThrough, process: ChildProcess}>}
 */
export function secureSpawn(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs to prevent injection
      if (typeof command !== 'string' || !command.trim()) {
        throw ApiError.badRequest('Command must be a non-empty string');
      }
      
      if (!Array.isArray(args)) {
        throw ApiError.badRequest('Args must be an array');
      }
      
      // Validate each argument
      for (const arg of args) {
        if (typeof arg !== 'string') {
          throw ApiError.badRequest('All arguments must be strings');
        }
      }
      
      // Create streams for input/output
      const stdin = new PassThrough();
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      
      // Spawn the process with secure options
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        // Prevent shell interpretation
        shell: false,
        // Set reasonable limits
        maxBuffer: 1024 * 1024, // 1MB buffer limit
        ...options
      });
      
      // Pipe streams
      stdin.pipe(child.stdin);
      child.stdout.pipe(stdout);
      child.stderr.pipe(stderr);
      
      // Handle process events
      child.on('error', (error) => {
        reject(ApiError.internal(`Process spawn error: ${error.message}`));
      });
      
      child.on('exit', (code, signal) => {
        if (code !== 0) {
          reject(ApiError.internal(`Process exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`));
        }
      });
      
      // Resolve with streams and process reference
      resolve({
        stdin,
        stdout,
        stderr,
        process: child
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Processes a stream through a command with secure spawn
 * @param {Readable} inputStream - Input stream to process
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {Object} options - Spawn options
 * @returns {Promise<PassThrough>} - Output stream
 */
export async function processStreamWithCommand(inputStream, command, args = [], options = {}) {
  const { stdin, stdout, stderr } = await secureSpawn(command, args, options);
  
  // Pipe input to process
  inputStream.pipe(stdin);
  
  // Handle errors
  inputStream.on('error', (err) => {
    stdin.destroy(err);
  });
  
  stderr.on('data', (data) => {
    // Process stderr
  });
  
  return stdout;
}

/**
 * Validates command and arguments for security
 * @param {string} command - Command to validate
 * @param {string[]} args - Arguments to validate
 * @throws {Error} If validation fails
 */
export function validateCommand(command, args = []) {
  // Ensure command is in allowed list (whitelist approach)
  const allowedCommands = [
    'qpdf',
    'soffice',
    'libreoffice',
    'gs',
    'ghostscript',
    'convert',
    'magick',
    'pdftk',
    'pdfinfo',
    'pdfseparate',
    'pdfunite'
  ];
  
  if (!allowedCommands.includes(command)) {
    throw ApiError.forbidden(`Command not in allowed list: ${command}`);
  }
  
  // Check for dangerous patterns in arguments (excluding file paths)
  const dangerousPatterns = [
    /rm\s+-rf/,
    /sudo/,
    /su\s+/,
    /chmod\s+777/,
    /wget\s+/,
    /curl\s+/,
    /nc\s+/,
    /netcat\s+/,
    /[;&|`$(){}[\]]/,  // Removed backslash from this pattern
    /\.\./,  // Prevent directory traversal
    /\/etc\//,  // Prevent access to system directories
    /\/bin\//,  // Prevent access to system binaries
    /\/usr\//,  // Prevent access to system directories
    /\/var\//,  // Prevent access to system directories
    /\/root\//,  // Prevent access to root directory
    /\/home\/[^\/]+\/\.\./,  // Prevent directory traversal in home
  ];
  
  // Check each argument individually
  for (const arg of args) {
    // Skip validation for file paths that are clearly temporary files
    if (arg.includes('/tmp/') || arg.includes('\\tmp\\') || arg.endsWith('.pdf') || arg.endsWith('.docx') || arg.endsWith('.pptx')) {
      continue;
    }
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(arg)) {
        throw ApiError.forbidden(`Potentially dangerous argument detected: ${arg}`);
      }
    }
  }
  
  // Additional validation for the full command string (excluding file paths)
  const fullCommand = `${command} ${args.join(' ')}`;
  const dangerousCommandPatterns = [
    /rm\s+-rf/,
    /sudo/,
    /su\s+/,
    /chmod\s+777/,
    /wget\s+/,
    /curl\s+/,
    /nc\s+/,
    /netcat\s+/,
    /[;&|`$(){}[\]]/,  // Removed backslash from this pattern
  ];
  
  for (const pattern of dangerousCommandPatterns) {
    if (pattern.test(fullCommand)) {
      throw ApiError.forbidden(`Potentially dangerous command detected: ${fullCommand}`);
    }
  }
}
