'use strict';

// Pure File Management - Watchface Precision
(function() {
    const fileQueue = [];
    const activeUploads = new Map();
    
    // DOM elements
    let uploadArea, fileInput, queueContainer, queueList, queueHeader, downloadAllBtn, clearAllBtn;
    
    // Initialize interface
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
        
        // Paste support
        document.addEventListener('paste', handlePaste);
        
        // Prevent default drag behaviors
        document.addEventListener('dragover', e => e.preventDefault());
        document.addEventListener('drop', e => e.preventDefault());
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragged');
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        if (!uploadArea.contains(e.relatedTarget)) {
            uploadArea.classList.remove('dragged');
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragged');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            addFilesToQueue(files);
        }
    }
    
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            addFilesToQueue(files);
        }
        e.target.value = '';
    }
    
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
                deletionToken: null,
                xhr: null
            };
            
            fileQueue.push(fileData);
            createFileElement(fileData);
            startUpload(fileData);
        });
        
        updateQueueDisplay();
    }
    
    function createFileElement(fileData) {
        const li = document.createElement('li');
        li.id = `file-${fileData.id}`;
        li.className = fileData.status;
        
        li.innerHTML = `
            <div class="file-info">
                <div class="file-name">${escapeHtml(fileData.name)}</div>
                <div class="file-meta">
                    <span class="file-size">${formatBytes(fileData.size)}</span>
                    <span class="file-type">${fileData.type || 'unknown'}</span>
                </div>
            </div>
            <div class="file-progress">
                <div class="progress-bar"></div>
            </div>
            <div class="file-actions">
                <button class="pause-btn" title="Pause">⏸</button>
                <button class="resume-btn" title="Resume" hidden>▶</button>
            </div>
            <div class="file-controls">
                <button class="copy-btn" title="Copy Link" disabled>Link</button>
                <button class="delete-btn" title="Delete">✗</button>
            </div>
        `;
        
        // Event listeners
        const pauseBtn = li.querySelector('.pause-btn');
        const resumeBtn = li.querySelector('.resume-btn');
        const copyBtn = li.querySelector('.copy-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        pauseBtn.addEventListener('click', () => pauseUpload(fileData.id));
        resumeBtn.addEventListener('click', () => resumeUpload(fileData.id));
        copyBtn.addEventListener('click', () => copyLink(fileData.id));
        deleteBtn.addEventListener('click', () => deleteFile(fileData.id));
        
        queueList.appendChild(li);
    }
    
    function startUpload(fileData) {
        fileData.status = 'uploading';
        updateFileElement(fileData);
        
        const xhr = new XMLHttpRequest();
        fileData.xhr = xhr;
        activeUploads.set(fileData.id, xhr);
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                fileData.progress = (e.loaded / e.total) * 100;
                updateFileElement(fileData);
            }
        });
        
        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                activeUploads.delete(fileData.id);
                
                if (xhr.status === 200) {
                    const response = xhr.responseText.trim();
                    fileData.url = response;
                    fileData.status = 'completed';
                    fileData.progress = 100;
                    
                    // Get deletion URL from X-Url-Delete header
                    const deleteUrl = xhr.getResponseHeader('X-Url-Delete');
                    if (deleteUrl) {
                        fileData.deleteUrl = deleteUrl;
                    } else {
                        // Fallback: extract deletion token from URL pattern
                        const urlParts = response.split('/');
                        if (urlParts.length >= 2) {
                            fileData.deletionToken = urlParts[urlParts.length - 2];
                        }
                    }
                } else {
                    fileData.status = 'error';
                }
                
                updateFileElement(fileData);
                updateQueueDisplay();
            }
        });
        
        xhr.open('PUT', '/' + encodeURIComponent(fileData.name), true);
        xhr.send(fileData.file);
    }
    
    function pauseUpload(fileId) {
        const fileData = fileQueue.find(f => f.id === fileId);
        if (!fileData || !fileData.xhr) return;
        
        fileData.xhr.abort();
        fileData.status = 'paused';
        activeUploads.delete(fileId);
        updateFileElement(fileData);
    }
    
    function resumeUpload(fileId) {
        const fileData = fileQueue.find(f => f.id === fileId);
        if (!fileData || fileData.status !== 'paused') return;
        
        startUpload(fileData);
    }
    
    function copyLink(fileId) {
        const fileData = fileQueue.find(f => f.id === fileId);
        if (!fileData || !fileData.url) return;
        
        copyToClipboard(fileData.url);
        
        const copyBtn = document.querySelector(`#file-${fileId} .copy-btn`);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 1500);
    }
    
    function deleteFile(fileId) {
        const fileData = fileQueue.find(f => f.id === fileId);
        if (!fileData) return;
        
        // Cancel upload if in progress
        if (fileData.xhr) {
            fileData.xhr.abort();
            activeUploads.delete(fileId);
        }
        
        // Delete from server if uploaded
        if (fileData.status === 'completed') {
            if (fileData.deleteUrl) {
                // Use the proper deletion URL from X-Url-Delete header
                const xhr = new XMLHttpRequest();
                xhr.open('DELETE', fileData.deleteUrl, true);
                xhr.send();
            } else if (fileData.deletionToken) {
                // Fallback method
                const xhr = new XMLHttpRequest();
                xhr.open('DELETE', fileData.url + '/' + fileData.deletionToken, true);
                xhr.send();
            }
        }
        
        // Remove from queue
        const index = fileQueue.findIndex(f => f.id === fileId);
        if (index > -1) {
            fileQueue.splice(index, 1);
        }
        
        // Remove from DOM
        const element = document.getElementById(`file-${fileId}`);
        if (element) {
            element.remove();
        }
        
        updateQueueDisplay();
    }
    
    function downloadAll() {
        const completedFiles = fileQueue.filter(f => f.status === 'completed' && f.url);
        if (completedFiles.length === 0) return;
        
        if (completedFiles.length === 1) {
            copyToClipboard(completedFiles[0].url);
        } else {
            const filePaths = completedFiles.map(f => {
                const urlParts = f.url.split('/');
                return urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];
            });
            const zipUrl = window.location.origin + '/(' + filePaths.join(',') + ').zip';
            copyToClipboard(zipUrl);
        }
        
        const originalText = downloadAllBtn.textContent;
        downloadAllBtn.textContent = 'Copied';
        setTimeout(() => {
            downloadAllBtn.textContent = originalText;
        }, 1500);
    }
    
    function clearAll() {
        // Cancel all active uploads
        activeUploads.forEach(xhr => xhr.abort());
        activeUploads.clear();
        
        // Delete completed files from server
        fileQueue.forEach(fileData => {
            if (fileData.status === 'completed') {
                if (fileData.deleteUrl) {
                    const xhr = new XMLHttpRequest();
                    xhr.open('DELETE', fileData.deleteUrl, true);
                    xhr.send();
                } else if (fileData.deletionToken) {
                    const xhr = new XMLHttpRequest();
                    xhr.open('DELETE', fileData.url + '/' + fileData.deletionToken, true);
                    xhr.send();
                }
            }
        });
        
        // Clear queue
        fileQueue.length = 0;
        queueList.innerHTML = '';
        updateQueueDisplay();
    }
    
    function updateFileElement(fileData) {
        const element = document.getElementById(`file-${fileData.id}`);
        if (!element) return;
        
        element.className = fileData.status;
        
        const progressBar = element.querySelector('.progress-bar');
        const pauseBtn = element.querySelector('.pause-btn');
        const resumeBtn = element.querySelector('.resume-btn');
        const copyBtn = element.querySelector('.copy-btn');
        const progressContainer = element.querySelector('.file-progress');
        
        if (progressBar) {
            progressBar.style.width = `${fileData.progress}%`;
        }
        
        if (fileData.status === 'completed') {
            progressContainer.classList.add('complete');
            pauseBtn.hidden = true;
            resumeBtn.hidden = true;
            copyBtn.disabled = false;
        } else if (fileData.status === 'paused') {
            pauseBtn.hidden = true;
            resumeBtn.hidden = false;
        } else if (fileData.status === 'uploading') {
            pauseBtn.hidden = false;
            resumeBtn.hidden = true;
        } else {
            pauseBtn.hidden = true;
            resumeBtn.hidden = true;
        }
    }
    
    function updateQueueDisplay() {
        const hasFiles = fileQueue.length > 0;
        const completedFiles = fileQueue.filter(f => f.status === 'completed');
        
        if (downloadAllBtn) {
            downloadAllBtn.disabled = completedFiles.length === 0;
            downloadAllBtn.textContent = completedFiles.length <= 1 ? 'Copy link' : 'Copy archive';
        }
        
        if (clearAllBtn) {
            clearAllBtn.disabled = fileQueue.length === 0;
        }
        
        // Show/hide empty state
        const emptyState = queueContainer.querySelector('.queue-empty');
        if (!hasFiles && emptyState) {
            emptyState.style.display = 'block';
        } else if (hasFiles && emptyState) {
            emptyState.style.display = 'none';
        }
    }
    
    // Utility functions
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }
    
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
