/**
 * Transfer.sh - Ramsian Enhancement Protocol
 * 
 * Philosophy: Enhancement ≠ Enabling
 * Every line justified by user need, not developer convenience
 * Progressive reduction: maximum function, minimum code
 */

'use strict';

/**
 * File type classification for visual recognition
 * Optimized for instant recognition at glance
 */
const FILE_TYPES = {
    image: /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i,
    video: /\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/i,
    audio: /\.(mp3|wav|flac|aac|ogg|wma|m4a)$/i,
    document: /\.(pdf|doc|docx|txt|rtf|odt|pages)$/i,
    archive: /\.(zip|rar|7z|tar|gz|bz2)$/i
};

/**
 * Get file type from filename
 * @param {string} filename - The filename to classify
 * @returns {string} Type category
 */
function getFileType(filename) {
    for (const [type, pattern] of Object.entries(FILE_TYPES)) {
        if (pattern.test(filename)) return type;
    }
    return 'other';
}

/**
 * Get file type icon content
 * @param {string} type - File type category
 * @returns {string} Icon text
 */
function getFileTypeIcon(type) {
    const icons = {
        image: '🖼️',
        video: '🎬',
        audio: '🎵',
        document: '📄',
        archive: '📦',
        other: '📁'
    };
    return icons[type] || icons.other;
}

/**
 * Core file sharing class
 * Follows enhancement principle: works without JS, enhanced with JS
 */
class MinimalFileSharing {
    constructor() {
        this.uploadedFiles = [];
        
        // Critical DOM elements only
        this.form = document.getElementById('upload-form');
        this.fileInput = document.getElementById('file-input');
        this.uploadArea = document.querySelector('.upload-area');
        this.fileGrid = document.getElementById('file-grid');
        this.copyAllBtn = document.getElementById('copy-all-btn');
        
        this.init();
    }
    
    /**
     * Initialize only if enhancement APIs exist
     * Graceful degradation: no JS = basic form still works
     */
    init() {
        if (!this.form || !('fetch' in window)) return;
        
        // Progressive enhancement layers
        this.enhanceDragDrop();
        this.enhanceInstantUpload();
        this.bindCopyAll();
    }
    
    /**
     * Drag and drop enhancement
     * Justification: Genuine capability addition over standard form
     */
    enhanceDragDrop() {
        if (!this.uploadArea) return;
        
        // CSS class-based state management (no direct style manipulation)
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!this.uploadArea.contains(e.relatedTarget)) {
                this.uploadArea.classList.remove('dragover');
            }
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer?.files;
            if (files?.length > 0) {
                this.fileInput.files = files;
                this.processFiles(files);
            }
        });
    }
    
    /**
     * Instant upload enhancement
     * Justification: Eliminates unnecessary staging step
     */
    enhanceInstantUpload() {
        if (!this.fileInput) return;
        
        // Remove manual upload button - not needed with instant upload
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.remove();
        }
        
        // Instant upload on file selection
        this.fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files?.length > 0) {
                this.processFiles(files);
            }
        });
        
        // Prevent manual form submission (now handled by file change)
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
    
    /**
     * Copy all functionality
     * Justification: Primary workflow for batch sharing
     */
    bindCopyAll() {
        if (!this.copyAllBtn) return;
        
        this.copyAllBtn.addEventListener('click', () => {
            this.copyAllLinks();
        });
    }
    
    /**
     * Process files immediately upon selection
     * Each file gets its own progress tracking
     * @param {FileList} files - Files to upload
     */
    async processFiles(files) {
        const fileArray = Array.from(files);
        
        // Create placeholder items immediately for instant feedback
        const placeholders = fileArray.map(file => ({
            name: file.name,
            size: file.size,
            type: getFileType(file.name),
            status: 'uploading',
            progress: 0,
            uploadTime: new Date()
        }));
        
        // Add placeholders to grid immediately
        this.uploadedFiles.push(...placeholders);
        this.renderFileGrid();
        
        // Upload files in parallel with individual progress
        const uploadPromises = fileArray.map((file, index) => 
            this.uploadWithProgress(file, this.uploadedFiles.length - fileArray.length + index)
        );
        
        await Promise.allSettled(uploadPromises);
        this.resetForm();
    }
    
    /**
     * Upload file with progress tracking
     * Updates file item in place as upload progresses
     * @param {File} file - File to upload
     * @param {number} fileIndex - Index in uploadedFiles array
     */
    async uploadWithProgress(file, fileIndex) {
        try {
            // Simulate progress for better UX (real progress needs server support)
            const progressInterval = setInterval(() => {
                const fileData = this.uploadedFiles[fileIndex];
                if (fileData.status === 'uploading' && fileData.progress < 90) {
                    fileData.progress += Math.random() * 20;
                    this.updateFileItem(fileIndex);
                }
            }, 200);
            
            const response = await fetch(`/${encodeURIComponent(file.name)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type || 'application/octet-stream'
                },
                body: file
            });
            
            clearInterval(progressInterval);
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }
            
            const downloadUrl = (await response.text()).trim();
            const deleteUrl = response.headers.get('X-Url-Delete');
            
            // Update file data with success
            this.uploadedFiles[fileIndex] = {
                ...this.uploadedFiles[fileIndex],
                status: 'success',
                progress: 100,
                downloadUrl,
                deleteUrl
            };
            
            this.updateFileItem(fileIndex);
            
        } catch (error) {
            // Update file data with error
            this.uploadedFiles[fileIndex] = {
                ...this.uploadedFiles[fileIndex],
                status: 'error',
                error: error.message
            };
            
            this.updateFileItem(fileIndex);
            console.error('Upload error:', error);
        }
    }
    
    /**
     * Render file grid with bento layout
     * Implements click-to-copy and visual file type indicators
     */
    renderFileGrid() {
        if (!this.fileGrid) return;
        
        if (this.uploadedFiles.length === 0) {
            this.fileGrid.innerHTML = '<p class="empty-state">No files shared yet</p>';
            this.copyAllBtn.hidden = true;
            return;
        }
        
        // Show copy all button only if we have successful uploads
        const hasSuccessfulUploads = this.uploadedFiles.some(f => f.status === 'success');
        this.copyAllBtn.hidden = !hasSuccessfulUploads;
        
        let html = '';
        
        this.uploadedFiles.forEach((file, index) => {
            html += this.renderFileItem(file, index);
        });
        
        this.fileGrid.innerHTML = html;
    }
    
    /**
     * Render individual file item
     * @param {Object} file - File data
     * @param {number} index - File index
     * @returns {string} HTML string
     */
    renderFileItem(file, index) {
        const size = this.formatFileSize(file.size);
        const time = file.uploadTime.toLocaleTimeString();
        const typeIcon = getFileTypeIcon(file.type);
        
        // Different rendering based on status
        let statusContent = '';
        let itemClass = 'file-item';
        let clickHandler = '';
        
        if (file.status === 'uploading') {
            itemClass += ' uploading';
            statusContent = `
                <div class="upload-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${file.progress || 0}%"></div>
                    </div>
                    <div class="progress-text">Uploading... ${Math.round(file.progress || 0)}%</div>
                </div>
            `;
        } else if (file.status === 'success') {
            itemClass += ' success';
            clickHandler = `onclick="fileSharing.copyFileLink(${index}, this)" tabindex="0" onkeydown="fileSharing.handleKeydown(event, ${index}, this)"`;
            statusContent = `
                <div class="file-details">
                    <span class="file-size">${size}</span> • 
                    <span class="file-time">${time}</span>
                </div>
            `;
        } else if (file.status === 'error') {
            itemClass += ' error';
            statusContent = `
                <div class="file-error">
                    Upload failed
                </div>
            `;
        }
        
        return `
            <div class="${itemClass}" 
                 role="listitem" 
                 data-index="${index}"
                 data-url="${file.downloadUrl ? this.escapeHtml(file.downloadUrl) : ''}"
                 ${clickHandler}>
                
                <div class="file-type-icon" data-type="${file.type}">${typeIcon}</div>
                
                <div class="file-info">
                    <div class="file-name" title="${this.escapeHtml(file.name)}">
                        ${this.escapeHtml(file.name)}
                    </div>
                    ${statusContent}
                </div>
                
                ${file.deleteUrl ? `
                    <div class="file-actions">
                        <button type="button" 
                                class="button-danger" 
                                onclick="event.stopPropagation(); fileSharing.deleteFile(${index})"
                                title="Delete ${this.escapeHtml(file.name)}">
                            ×
                        </button>
                    </div>
                ` : ''}
                
                <div class="copy-feedback">Copied!</div>
            </div>
        `;
    }
    
    /**
     * Update single file item without full re-render
     * @param {number} index - File index to update
     */
    updateFileItem(index) {
        const fileElement = this.fileGrid.querySelector(`[data-index="${index}"]`);
        if (fileElement) {
            const file = this.uploadedFiles[index];
            const newHtml = this.renderFileItem(file, index);
            fileElement.outerHTML = newHtml;
        }
        
        // Update copy all button visibility
        const hasSuccessfulUploads = this.uploadedFiles.some(f => f.status === 'success');
        this.copyAllBtn.hidden = !hasSuccessfulUploads;
    }
    
    /**
     * Copy individual file link on click
     * @param {number} index - File index
     * @param {Element} element - Clicked element
     */
    async copyFileLink(index, element) {
        const file = this.uploadedFiles[index];
        if (!file) return;
        
        try {
            await navigator.clipboard.writeText(file.downloadUrl);
            this.showCopyFeedback(element);
        } catch (error) {
            this.fallbackCopy(file.downloadUrl, element);
        }
    }
    
    /**
     * Handle keyboard interaction for file items
     * @param {Event} event - Keyboard event
     * @param {number} index - File index
     * @param {Element} element - File element
     */
    handleKeydown(event, index, element) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.copyFileLink(index, element);
        }
    }
    
    /**
     * Copy ZIP download link for all files
     * Primary workflow function - creates actual downloadable ZIP
     */
    async copyAllLinks() {
        if (this.uploadedFiles.length === 0) return;
        
        const zipUrl = this.createBatchZipUrl();
        
        try {
            await navigator.clipboard.writeText(zipUrl);
            this.copyAllBtn.textContent = 'ZIP Link Copied!';
            setTimeout(() => {
                this.copyAllBtn.textContent = 'Copy ZIP Link';
            }, 2000);
        } catch (error) {
            this.fallbackCopy(zipUrl);
        }
    }
    
    /**
     * Create batch ZIP download URL using transfer.sh syntax
     * Format: /(token1/file1,token2/file2).zip
     * @returns {string} ZIP download URL
     */
    createBatchZipUrl() {
        const files = this.uploadedFiles.map(file => {
            const url = new URL(file.downloadUrl);
            return url.pathname.substring(1); // Remove leading slash
        });
        return `${window.location.origin}/(${files.join(',')}).zip`;
    }
    
    /**
     * Show visual feedback for copy action
     * @param {Element} element - Element to show feedback on
     */
    showCopyFeedback(element) {
        const feedback = element.querySelector('.copy-feedback');
        if (feedback) {
            feedback.classList.add('show');
            setTimeout(() => {
                feedback.classList.remove('show');
            }, 1500);
        }
        
        // Temporary visual state
        element.setAttribute('data-copied', 'true');
        setTimeout(() => {
            element.removeAttribute('data-copied');
        }, 1500);
    }
    
    /**
     * Fallback copy for browsers without clipboard API
     * @param {string} text - Text to copy
     * @param {Element} element - Optional element for feedback
     */
    fallbackCopy(text, element) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            if (element) this.showCopyFeedback(element);
        } catch (error) {
            // Last resort: show prompt
            prompt('Copy this link:', text);
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    /**
     * Delete file with confirmation
     * @param {number} index - File index to delete
     */
    async deleteFile(index) {
        const file = this.uploadedFiles[index];
        if (!file?.deleteUrl) return;
        
        if (!confirm(`Delete ${file.name}? This cannot be undone.`)) return;
        
        try {
            const response = await fetch(file.deleteUrl, { method: 'DELETE' });
            
            if (response.ok) {
                this.uploadedFiles.splice(index, 1);
                this.renderFileGrid();
            } else {
                throw new Error('Delete request failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file. Please try again.');
        }
    }
    
    
    /**
     * Reset form to initial state
     */
    resetForm() {
        if (this.form) {
            this.form.reset();
        }
        this.uploadArea?.classList.remove('dragover');
    }
    
    /**
     * Format file size for human reading
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize after DOM ready
// Follows progressive enhancement: no JS = form still works
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.fileSharing = new MinimalFileSharing();
    });
} else {
    window.fileSharing = new MinimalFileSharing();
}