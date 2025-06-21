import logger from './logger.js';

const STATUS_MAPPINGS = {
  'validating_magic_numbers': 'Initializing...',
  'uploading': 'Uploading your file...',
  'uploading_to_s3': 'Uploading your file...',
  'processing': 'Processing your file...',
  'compressing_with_qpdf': 'Processing your file...',
  'merging_files': 'Processing your file...',
  'splitting_pages': 'Processing your file...',
  'rotating_pages': 'Processing your file...',
  'adding_watermark': 'Processing your file...',
  'adding_page_numbers': 'Processing your file...',
  'converting_format': 'Processing your file...',
  'unlocking_pdf': 'Processing your file...',
  'protecting_pdf': 'Processing your file...',
  'generating_output': 'Finalizing...',
  'uploading_result': 'Finalizing...',
  'completed': 'Complete!',
  'failed': 'Failed',
  'error': 'Failed'
};

const PROGRESS_MAPPINGS = {
  'validating_magic_numbers': 5,
  'uploading': 15,
  'uploading_to_s3': 20,
  'processing': 25,
  'compressing_with_qpdf': 30,
  'merging_files': 35,
  'splitting_pages': 40,
  'rotating_pages': 45,
  'adding_watermark': 50,
  'adding_page_numbers': 55,
  'converting_format': 60,
  'unlocking_pdf': 65,
  'protecting_pdf': 70,
  'generating_output': 80,
  'uploading_result': 90,
  'completed': 100,
  'failed': 0,
  'error': 0
};

export function mapJobStatusToUserFriendly(status, customMessage = null) {
  if (customMessage) {
    return customMessage;
  }
  
  const mappedStatus = STATUS_MAPPINGS[status] || 'Processing your file...';
  
  logger.debug('Job status mapped', {
    originalStatus: status,
    mappedStatus: mappedStatus
  });
  
  return mappedStatus;
}

export function getProgressForStatus(status) {
  return PROGRESS_MAPPINGS[status] || 25;
}

export function shouldSimulateProgress(status) {
  const progressStates = [
    'processing',
    'compressing_with_qpdf',
    'merging_files',
    'splitting_pages',
    'rotating_pages',
    'adding_watermark',
    'adding_page_numbers',
    'converting_format',
    'unlocking_pdf',
    'protecting_pdf'
  ];
  
  return progressStates.includes(status);
}
