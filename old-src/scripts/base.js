'use strict';

/**
 * Transfer.sh Web Interface - Pure Function File Management
 * Implements the complete transfer.sh API as documented at:
 * https://raw.githubusercontent.com/dutchcoders/transfer.sh/refs/heads/main/README.md
 */
(function() {
    // State management
    const fileQueue = [];
    const activeUploads = new Map();
    
    // DOM elements cache
    let uploadArea, fileInput, queueContainer, queueList, queueHeader, downloadAllBtn, clearAllBtn;
    
    /**
     * Initialize the upload interface
     */
    function init() {
        uploadArea = document.getElementById('upload-area');
        fileInput = document.getElementById('file-input');
        queueContainer = document.getElementById('file-queue');
        queueList = queueContainer.querySelector('.queue');
        queueHeader = queueContainer.querySelector('.queue-header');
        downloadAllBtn = document.getElementById('download-all');
        clearAllBtn = document.getElementById('clear-all');
        
        if (!uploadArea || !fileInput) return;
        
        setupEventListeners();
        updateQueueDisplay();
    }
    
    /**
     * Set up all event listeners for file upload interface
     */
    function setupEventListeners() {
        // Upload area interactions
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        
        // File input
        fileInput.addEventListener('change', handleFileSelect);
        
        // Queue actions
        if (downloadAllBtn) downloadAllBtn.addEventListener('click', downloadAll);
        if (clearAllBtn) clearAllBtn.addEventListener('click', clearAll);
        
        // Paste support for files
        document.addEventListener('paste', handlePaste);
        
        // Prevent default drag behaviors on document
        document.addEventListener('dragover', e => e.preventDefault());
        document.addEventListener('drop', e => e.preventDefault());
        
        // Prevent page unload during uploads
        window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    /**
     * Handle drag over event for upload area
     */
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragged');
    }
    
    /**
     * Handle drag leave event for upload area
     */
    function handleDragLeave(e) {
        e.preventDefault();
        if (!uploadArea.contains(e.relatedTarget)) {
            uploadArea.classList.remove('dragged');
        }
    }
    
    /**
     * Handle file drop on upload area
     */
    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragged');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            addFilesToQueue(files);
        }
    }
    
    /**
     * Handle file selection from file input
     */
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            addFilesToQueue(files);
        }
        e.target.value = ''; // Reset input
    }
    
    /**
     * Handle clipboard paste for files
     */
    function handlePaste(e) {
        const items = Array.from(e.clipboardData.items);
        const files = items
            .filter(item => item.kind === 'file')
            .map(item => item.getAsFile())
            .filter(file => file);
        
        if (files.length > 0) {
            addFilesToQueue(files);
        }
    }
    
    /**
     * Prevent page unload during active uploads
     */
    function handleBeforeUnload(e) {
        if (activeUploads.size > 0) {
            const message = 'Files are still uploading. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        }
    }
    
    /**
     * Add files to the upload queue and start uploads
     * Implements transfer.sh PUT API: PUT /{filename}
     */
    function addFilesToQueue(files) {
        files.forEach(file => {
            const fileData = {
                id: generateId(),
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'queued',
                progress: 0,
                url: null,
                deleteUrl: null,
                deleteToken: null,
                xhr: null
            };
            
            fileQueue.push(fileData);
            createFileElement(fileData);
            startUpload(fileData);
        });
        
        updateQueueDisplay();
    }
    
    /**
     * Start file upload using transfer.sh API
     * API: PUT /{filename}
     * Response headers: X-Url-Delete
     */
    function startUpload(fileData) {
        const xhr = new XMLHttpRequest();
        fileData.xhr = xhr;
        activeUploads.set(fileData.id, xhr);
        
        // Upload progress tracking
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                fileData.progress = progress;
                updateFileElement(fileData);
            }
        });
        
        // Upload completion handling
        xhr.addEventListener('load', () => {
            activeUploads.delete(fileData.id);
            
            if (xhr.status >= 200 && xhr.status < 300) {
                fileData.status = 'completed';
                fileData.url = xhr.responseText.trim();
                
                // Extract deletion URL from X-Url-Delete header
                const deleteUrl = xhr.getResponseHeader('X-Url-Delete');
                if (deleteUrl) {
                    fileData.deleteUrl = deleteUrl;
                    // Extract token from delete URL (last segment)
                    const urlParts = deleteUrl.split('/');
                    fileData.deleteToken = urlParts[urlParts.length - 1];
                }
                
                updateFileElement(fileData);
                updateBatchActions();
            } else {
                fileData.status = 'error';
                updateFileElement(fileData);
            }
        });
        
        // Upload error handling
        xhr.addEventListener('error', () => {
            activeUploads.delete(fileData.id);
            fileData.status = 'error';
            updateFileElement(fileData);
        });
        
        // Upload abort handling
        xhr.addEventListener('abort', () => {
            activeUploads.delete(fileData.id);
            fileData.status = 'paused';
            updateFileElement(fileData);
        });
        
        // Start upload to transfer.sh
        fileData.status = 'uploading';
        updateFileElement(fileData);
        
        xhr.open('PUT', `/${encodeURIComponent(fileData.name)}`);
        xhr.send(fileData.file);
    }
    
    /**
     * Pause an active upload
     */
    function pauseUpload(fileId) {
        const fileData = fileQueue.find(f => f.id === fileId);
        if (fileData && fileData.xhr) {
            fileData.xhr.abort();
            fileData.status = 'paused';
            updateFileElement(fileData);
        }
    }
    
    /**
     * Resume a paused upload
     */
    function resumeUpload(fileId) {
        const fileData = fileQueue.find(f => f.id === fileId);
        if (fileData && fileData.status === 'paused') {
            startUpload(fileData);
        }
    }
    
    /**
     * Delete file from server and queue
     * API: DELETE {deleteUrl} or DELETE /{url}/{token}
     */
    function deleteFile(fileId) {
        const fileIndex = fileQueue.findIndex(f => f.id === fileId);
        if (fileIndex === -1) return;
        
        const fileData = fileQueue[fileIndex];
        
        // Cancel upload if in progress
        if (fileData.xhr) {
            fileData.xhr.abort();
            activeUploads.delete(fileId);
        }
        
        // Delete from server if uploaded
        if (fileData.deleteUrl) {
            fetch(fileData.deleteUrl, { method: 'DELETE' }).catch(() => {
                // Ignore deletion errors - file might already be expired
            });
        }
        
        // Remove from queue
        fileQueue.splice(fileIndex, 1);
        
        // Remove UI element
        const element = document.querySelector(`[data-file-id="${fileId}"]`);
        if (element) element.remove();
        
        updateQueueDisplay();
        updateBatchActions();
    }
    
    /**
     * Create UI element for file in queue
     */
    function createFileElement(fileData) {
        const li = document.createElement('li');
        li.setAttribute('data-file-id', fileData.id);
        li.className = `file-item ${fileData.status}`;
        
        updateFileElementContent(li, fileData);
        queueList.appendChild(li);
    }
    
    /**
     * Update existing file element
     */
    function updateFileElement(fileData) {
        const element = document.querySelector(`[data-file-id="${fileData.id}"]`);
        if (element) {
            element.className = `file-item ${fileData.status}`;
            updateFileElementContent(element, fileData);
        }
    }
    
    /**
     * Update file element content and controls
     */
    function updateFileElementContent(element, fileData) {
        const formatSize = (bytes) => {
            const units = ['B', 'KB', 'MB', 'GB'];
            let size = bytes;
            let unitIndex = 0;
            while (size >= 1024 && unitIndex < units.length - 1) {
                size /= 1024;
                unitIndex++;
            }
            return `${size.toFixed(1)} ${units[unitIndex]}`;
        };
        
        const progressHtml = fileData.status === 'uploading' || fileData.status === 'completed' 
            ? `<div class="file-progress ${fileData.status === 'completed' ? 'complete' : ''}">
                 <div class="progress-bar" style="width: ${fileData.progress}%"></div>
               </div>`
            : '';
        
        const actionButtons = () => {
            switch (fileData.status) {
                case 'uploading':
                    return `<button class="pause-btn btn" onclick="pauseUpload('${fileData.id}')">Pause</button>`;
                case 'paused':
                    return `<button class="resume-btn btn" onclick="resumeUpload('${fileData.id}')">Resume</button>`;
                case 'completed':
                    return `<button class="copy-btn btn" onclick="copyLink('${fileData.url}')">Copy</button>`;
                default:
                    return '';
            }
        };
        
        element.innerHTML = `
            <div class="file-info">
                <div class="file-name">${escapeHtml(fileData.name)}</div>
                <div class="file-meta">
                    <span class="file-size">${formatSize(fileData.size)}</span>
                    <span class="file-type">${fileData.type}</span>
                    ${fileData.status === 'uploading' ? `<span class="file-progress-text">${fileData.progress}%</span>` : ''}
                </div>
            </div>
            <div class="file-actions">
                ${actionButtons()}
            </div>
            <div class="file-controls">
                <button class="delete-btn btn" onclick="deleteFile('${fileData.id}')">×</button>
            </div>
            ${progressHtml}
        `;
    }
    
    /**
     * Copy file URL to clipboard
     */
    function copyLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            // Could add visual feedback here
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }
    
    /**
     * Download all files as ZIP
     * API: GET /({token1}/{file1},{token2}/{file2}).zip
     */
    function downloadAll() {
        const completedFiles = fileQueue.filter(f => f.status === 'completed' && f.url);
        if (completedFiles.length === 0) return;
        
        if (completedFiles.length === 1) {
            // Single file - direct download
            window.open(completedFiles[0].url, '_blank');
        } else {
            // Multiple files - batch ZIP download
            const fileTokens = completedFiles.map(f => {
                // Extract token from URL (format: /{token}/{filename})
                const urlParts = f.url.split('/');
                return `${urlParts[1]}/${encodeURIComponent(f.name)}`;
            });
            
            const zipUrl = `/\(${fileTokens.join(',')}\).zip`;
            window.open(zipUrl, '_blank');
        }
    }
    
    /**
     * Clear all files from queue
     */
    function clearAll() {
        // Delete all files from server
        fileQueue.forEach(fileData => {
            if (fileData.deleteUrl) {
                fetch(fileData.deleteUrl, { method: 'DELETE' }).catch(() => {});
            }
            if (fileData.xhr) {
                fileData.xhr.abort();
            }
        });
        
        // Clear queues and UI
        fileQueue.length = 0;
        activeUploads.clear();
        queueList.innerHTML = '';
        
        updateQueueDisplay();
        updateBatchActions();
    }
    
    /**
     * Update queue display visibility
     */
    function updateQueueDisplay() {
        if (fileQueue.length > 0) {
            queueContainer.style.display = 'block';
            queueContainer.querySelector('.queue-empty').style.display = 'none';
        } else {
            queueContainer.querySelector('.queue-empty').style.display = 'block';
        }
    }
    
    /**
     * Update batch action button states
     */
    function updateBatchActions() {
        const completedFiles = fileQueue.filter(f => f.status === 'completed');
        
        if (downloadAllBtn) {
            downloadAllBtn.disabled = completedFiles.length === 0;
            downloadAllBtn.textContent = completedFiles.length > 1 ? 'Download ZIP' : 'Download';
        }
        
        if (clearAllBtn) {
            clearAllBtn.disabled = fileQueue.length === 0;
        }
    }
    
    /**
     * Generate unique ID for files
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Global functions for inline event handlers
    window.pauseUpload = pauseUpload;
    window.resumeUpload = resumeUpload;
    window.deleteFile = deleteFile;
    window.copyLink = copyLink;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
