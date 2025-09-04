/**
 * Transfer.sh - Progressive Enhancement
 * Following Rams principles: enhance functionality, don't replace it
 * Everything must work without JavaScript
 */

'use strict';

class TransferApp {
    constructor() {
        this.uploadedFiles = [];
        this.isUploading = false;
        
        this.initializeElements();
        this.bindEvents();
        this.enhanceUploadArea();
    }

    initializeElements() {
        this.uploadForm = document.getElementById('upload-form');
        this.fileInput = document.getElementById('file-input');
        this.uploadArea = document.querySelector('.upload-area');
        this.progressSection = document.querySelector('.upload-progress');
        this.progressBar = document.querySelector('progress');
        this.progressText = document.getElementById('progress-text');
        this.fileList = document.querySelector('.file-list');
    }

    bindEvents() {
        if (this.uploadForm) {
            this.uploadForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        if (this.fileInput) {
            this.fileInput.addEventListener('change', this.handleFileSelection.bind(this));
        }

        if (this.uploadArea) {
            this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
            this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        }
    }

    enhanceUploadArea() {
        if (!this.uploadArea) return;

        // Add drag and drop enhancement
        const label = this.uploadArea.querySelector('label');
        if (label) {
            label.textContent = 'Choose files or drag them here';
        }
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isUploading) return;
        
        const files = this.fileInput.files;
        if (files.length === 0) return;

        this.uploadFiles(files);
    }

    handleFileSelection(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.previewFiles(files);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.style.borderColor = '#2563eb';
        this.uploadArea.style.backgroundColor = '#eff6ff';
    }

    handleDragLeave(event) {
        event.preventDefault();
        if (!this.uploadArea.contains(event.relatedTarget)) {
            this.uploadArea.style.borderColor = '#d1d5db';
            this.uploadArea.style.backgroundColor = 'transparent';
        }
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.style.borderColor = '#d1d5db';
        this.uploadArea.style.backgroundColor = 'transparent';

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.fileInput.files = files;
            this.previewFiles(files);
        }
    }

    previewFiles(files) {
        const fileArray = Array.from(files);
        let preview = '<h3>Ready to upload:</h3>';
        
        fileArray.forEach(file => {
            const size = this.formatFileSize(file.size);
            preview += `
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-name">${this.escapeHtml(file.name)}</div>
                        <div class="file-details">${size} • ${file.type || 'Unknown type'}</div>
                    </div>
                </div>
            `;
        });

        if (this.fileList) {
            this.fileList.innerHTML = preview;
        }
    }

    async uploadFiles(files) {
        this.isUploading = true;
        this.showProgress();

        try {
            const fileArray = Array.from(files);
            let completed = 0;

            for (const file of fileArray) {
                await this.uploadSingleFile(file);
                completed++;
                this.updateProgress((completed / fileArray.length) * 100);
            }

            this.hideProgress();
            this.displayUploadedFiles();
            this.resetForm();

        } catch (error) {
            this.hideProgress();
            this.showError('Upload failed. Please try again.');
        }

        this.isUploading = false;
    }

    async uploadSingleFile(file) {
        const headers = {
            'Content-Type': file.type || 'application/octet-stream'
        };

        const response = await fetch(`/${encodeURIComponent(file.name)}`, {
            method: 'PUT',
            headers: headers,
            body: file
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        const downloadUrl = await response.text();
        const deleteUrl = response.headers.get('X-Url-Delete');

        this.uploadedFiles.push({
            name: file.name,
            size: file.size,
            downloadUrl: downloadUrl.trim(),
            deleteUrl: deleteUrl,
            uploadTime: new Date()
        });
    }

    displayUploadedFiles() {
        if (this.uploadedFiles.length === 0) {
            this.fileList.innerHTML = '<p>No files uploaded yet.</p>';
            return;
        }

        let html = '<h3>Your Files</h3>';
        
        this.uploadedFiles.forEach((file, index) => {
            const size = this.formatFileSize(file.size);
            const time = file.uploadTime.toLocaleTimeString();
            
            html += `
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-name">${this.escapeHtml(file.name)}</div>
                        <div class="file-details">${size} • Uploaded at ${time}</div>
                    </div>
                    <div class="file-actions">
                        <button type="button" class="secondary" onclick="app.copyLink('${this.escapeHtml(file.downloadUrl)}', this)">
                            Copy Link
                        </button>
                        ${file.deleteUrl ? `
                            <button type="button" class="delete-btn" onclick="app.deleteFile(${index})">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        // Add batch download option if multiple files
        if (this.uploadedFiles.length > 1) {
            const batchUrl = this.createBatchDownloadUrl();
            html += `
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-name">Download All (ZIP)</div>
                        <div class="file-details">${this.uploadedFiles.length} files</div>
                    </div>
                    <div class="file-actions">
                        <button type="button" class="secondary" onclick="app.copyLink('${this.escapeHtml(batchUrl)}', this)">
                            Copy ZIP Link
                        </button>
                    </div>
                </div>
            `;
        }

        this.fileList.innerHTML = html;
    }

    createBatchDownloadUrl() {
        const files = this.uploadedFiles.map(file => {
            const url = new URL(file.downloadUrl);
            return url.pathname.substring(1); // Remove leading slash
        });
        return `${window.location.origin}/(${files.join(',')}).zip`;
    }

    async copyLink(url, button) {
        const originalText = button.textContent;
        try {
            await navigator.clipboard.writeText(url);
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        } catch (error) {
            // Fallback - show the URL for manual copying
            prompt('Copy this link:', url);
        }
    }

    async deleteFile(index) {
        const file = this.uploadedFiles[index];
        if (!file.deleteUrl) return;

        if (!confirm(`Delete ${file.name}?`)) return;

        try {
            const response = await fetch(file.deleteUrl, { method: 'DELETE' });
            
            if (response.ok) {
                this.uploadedFiles.splice(index, 1);
                this.displayUploadedFiles();
                this.showMessage('File deleted successfully.');
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            this.showError('Failed to delete file. Please try again.');
        }
    }

    showProgress() {
        if (this.progressSection) {
            this.progressSection.hidden = false;
        }
    }

    hideProgress() {
        if (this.progressSection) {
            this.progressSection.hidden = true;
        }
    }

    updateProgress(percent) {
        if (this.progressBar) {
            this.progressBar.value = percent;
        }
        if (this.progressText) {
            this.progressText.textContent = `${Math.round(percent)}% complete`;
        }
    }

    resetForm() {
        if (this.uploadForm) {
            this.uploadForm.reset();
        }
    }

    showMessage(message) {
        alert(message);
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new TransferApp();
    });
} else {
    window.app = new TransferApp();
}
