import { request } from '@/request';

class ApiService {
  // PDF Operations
  async mergePdfs(files, options = {}) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    Object.keys(options).forEach(key => formData.append(key, options[key]));
    
    return request.createAndUpload({
      entity: 'merge',
      jsonData: formData,
    });
  }

  async splitPdf(file, options) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(options).forEach(key => formData.append(key, options[key]));
    
    return request.createAndUpload({
      entity: 'split',
      jsonData: formData,
    });
  }

  async compressPdf(file, level = 'medium') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level', level);
    
    return request.createAndUpload({
      entity: 'compress',
      jsonData: formData,
    });
  }

  async convertPdf(file, format) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    
    return request.createAndUpload({
      entity: 'convert',
      jsonData: formData,
    });
  }

  async protectPdf(file, password) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    
    return request.createAndUpload({
      entity: 'protect',
      jsonData: formData,
    });
  }

  async unlockPdf(file, password) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    
    return request.createAndUpload({
      entity: 'unlock',
      jsonData: formData,
    });
  }

  async rotatePdf(file, angle) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('angle', angle);
    
    return request.createAndUpload({
      entity: 'rotate',
      jsonData: formData,
    });
  }

  async addWatermark(file, options) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(options).forEach(key => formData.append(key, options[key]));
    
    return request.createAndUpload({
      entity: 'watermark',
      jsonData: formData,
    });
  }

  async addPageNumbers(file, options) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(options).forEach(key => formData.append(key, options[key]));
    
    return request.createAndUpload({
      entity: 'pageNumbers',
      jsonData: formData,
    });
  }

  // User Operations
  async getUserProfile() {
    return request.read({
      entity: 'profile',
      id: 'me',
    });
  }

  async updateUserProfile(profileData) {
    return request.update({
      entity: 'profile',
      id: 'me',
      jsonData: profileData,
    });
  }

  async changePassword(passwordData) {
    return request.patch({
      entity: 'auth/change-password',
      jsonData: passwordData,
    });
  }

  // Download Operations
  async getDownloads(options = {}) {
    return request.list({
      entity: 'downloads',
      options,
    });
  }

  async deleteDownload(downloadId) {
    return request.delete({
      entity: 'downloads',
      id: downloadId,
    });
  }

  // File Operations
  async uploadFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(options).forEach(key => formData.append(key, options[key]));
    
    return request.createAndUpload({
      entity: 'files',
      jsonData: formData,
    });
  }

  async deleteFile(fileId) {
    return request.delete({
      entity: 'files',
      id: fileId,
    });
  }

  // Analytics
  async getUsageStats() {
    return request.get({
      entity: 'analytics/usage',
    });
  }

  async getFileStats() {
    return request.get({
      entity: 'analytics/files',
    });
  }
}

export default new ApiService();
