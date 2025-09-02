'use strict';

(function() {
    var files = Array();
    var queue = Array();

    $(window).bind('beforeunload', function(){
        if (queue.length===0)  {
            return;
        }

        return 'There are still ' + queue.length + ' files being uploaded.';
    });

    function deleteFile(baseURL) {
        var deleteModal = $('#delete-modal');
        var modalOverlay = deleteModal.find('.modal-overlay');
        var cancelBtn = $('#cancel-delete');
        var confirmBtn = $('#confirm-delete');
        var errorDiv = $('#error');
        var tokenInput = $('#deletion-token');
        
        // Show modal
        deleteModal.addClass('show');
        
        // Clear previous state
        tokenInput.val('');
        errorDiv.text('');
        
        // Close modal handlers
        function closeModal() {
            deleteModal.removeClass('show');
        }
        
        modalOverlay.off('click').on('click', closeModal);
        cancelBtn.off('click').on('click', closeModal);
        
        // Handle delete confirmation
        confirmBtn.off('click').on('click', function(event) {
            event.preventDefault();
            var deletionToken = tokenInput.val().trim();
            
            if (deletionToken.length === 0) {
                errorDiv.text('Please enter a deletion token');
                return;
            }
            
            confirmBtn.prop('disabled', true).text('Deleting...');
            
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    confirmBtn.prop('disabled', false).text('Delete');
                    
                    if (xhr.status === 200) {
                        errorDiv.css('color', '#28a745').text('File deleted successfully');
                        setTimeout(function() {
                            closeModal();
                            // Optionally redirect to home
                            window.location.href = '/';
                        }, 1500);
                    } else {
                        errorDiv.text('Error (' + xhr.status + ') during deletion of file');
                    }
                }
            };
            
            xhr.open('DELETE', baseURL + '/' + deletionToken, true);
            xhr.send();
        });
    }

    function prettyFileName(filename) {
        // Remove file extension for display
        var name = filename.replace(/\.[^/.]+$/, "");
        // Replace underscores and hyphens with spaces
        name = name.replace(/[_-]/g, ' ');
        // Capitalize first letter of each word
        return name.replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    }

    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            var textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    function upload(file) {
        var li = $('<li></li>');
        var deletionToken = '';
        
        // Create file info structure
        var fileInfo = $('<div class="file-info"></div>');
        var fileName = $('<div class="file-name">' + prettyFileName(file.name) + '</div>');
        var fileActions = $('<div class="file-actions"></div>');
        var fileStatus = $('<div class="file-status">Uploading...</div>');
        
        fileActions.append(fileStatus);
        fileInfo.append(fileName);
        fileInfo.append(fileActions);
        
        // Create progress bar
        var progressContainer = $('<div class="upload-progress"></div>');
        var progressBar = $('<div class="bar" style="width: 0%;"></div>');
        progressContainer.append(progressBar);
        
        li.append(fileInfo);
        li.append(progressContainer);
        $(li).appendTo($('.queue'));

        var xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', function(e) {
            var pc = parseInt((e.loaded / e.total * 100));
            progressBar.css('width', pc + '%');
        }, false);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    deletionToken = xhr.getResponseHeader('X-Url-Delete').split('/').pop();
                    var url = $('<p></p>').text(xhr.responseText).html();
                    
                    // Update file status and add copy token button
                    fileStatus.text('Ready');
                    var copyTokenBtn = $('<button class="copy-token-btn" title="Copy deletion token">🔑</button>');
                    copyTokenBtn.on('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        copyToClipboard(deletionToken);
                        $(this).text('✓').css('color', '#28a745');
                        setTimeout(function() {
                            copyTokenBtn.text('🔑').css('color', '');
                        }, 1500);
                    });
                    fileActions.append(copyTokenBtn);
                    
                    // Remove progress bar
                    progressContainer.remove();
                    
                    // Make file name clickable to navigate to file
                    fileName.css('cursor', 'pointer');
                    fileName.on('click', function() {
                        window.open(url, '_blank');
                    });
                    
                    // Add copy link button
                    var copyLinkBtn = $('<button class="copy-link-btn" title="Copy file link">🔗</button>');
                    copyLinkBtn.on('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        copyToClipboard(url);
                        $(this).text('✓').css('color', '#28a745');
                        setTimeout(function() {
                            copyLinkBtn.text('🔗').css('color', '');
                        }, 1500);
                    });
                    fileActions.append(copyLinkBtn);
                } else {
                    fileStatus.text('Error (' + xhr.status + ')');
                    progressContainer.remove();
                }

                // file uploaded successfully, remove from queue
                var index = queue.indexOf(xhr);
                if (index > -1) {
                    queue.splice(index, 1);
                }

                if (xhr.status === 200) {
                    files.push(URI($('<p></p>').text(xhr.responseText.replace('\n', '')).html()).path());

                    var zipUrl = URI('(' + files.join(',') + ').zip').absoluteTo(location.href).toString();
                    
                    $('.download-zip').data('url', zipUrl);

                    $('#batch-actions').addClass('show');
                }
            }
        };

        // should queue all uploads.
        queue.push(xhr);

        // start upload
        xhr.open('PUT', './' + file.name, true);
        xhr.send(file);
    }

    $(document).bind('dragenter', function(event) {
        event.preventDefault();
    }).bind('dragover', function(event) {
        event.preventDefault();
        // show drop indicator
        $('#upload-area').addClass('dragged');
    }).bind('dragleave', function(event) {
        // Only remove dragged class if we're leaving the document
        if (!event.relatedTarget || event.relatedTarget.nodeName === 'HTML') {
            $('#upload-area').removeClass('dragged');
        }
    }).bind('drop dragdrop', function(event) {
        $('#upload-area').removeClass('dragged');
        
        var files = event.originalEvent.target.files || event.originalEvent.dataTransfer.files;

        $.each(files, function(index, file) {
            upload(file);
        });

        event.stopPropagation();
        event.preventDefault();
    });

    $(document).bind('paste', function(event) {
        $.each(event.originalEvent.clipboardData.files, function(index, file) {
            upload(file);
        });
    });

    // File input handling - ensure it's properly initialized
    function initializeFileInput() {
        const fileInput = document.getElementById('file-input');
        if (!fileInput) {
            console.error('File input not found');
            return;
        }
        
        // Clear any existing event listeners
        $(fileInput).off('change');
        
        // Add change event listener
        $(fileInput).on('change', function(e) {
            const files = e.target.files;
            if (files && files.length > 0) {
                $.each(files, function(index, file) {
                    if (file instanceof Blob) {
                        upload(file);
                    }
                });
                // Clear the input so the same file can be selected again
                $(this).val('');
            }
        });
    }

    // Handle browse link clicks
    $(document).on('click', 'a.browse', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.click();
        }
        return false;
    });

    // Handle upload area clicks
    $(document).on('click', '#upload-area', function(e) {
        // Don't trigger if clicking on the browse link or file input itself
        if ($(e.target).hasClass('browse') || 
            $(e.target).closest('a.browse').length || 
            $(e.target).is('#file-input')) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.click();
        }
    });

    // Initialize file input when document is ready
    $(document).ready(function() {
        initializeFileInput();
    });

    $('#fire-delete').on('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        var baseURL = window.location.pathname;
        deleteFile(baseURL);
    });

    // Handle batch download button
    $('.download-zip').on('click', function(event) {
        event.preventDefault();
        var url = $(this).data('url');
        
        if (url) {
            copyToClipboard(url);
            var originalText = $(this).text();
            $(this).text('✓ Copied!').css('color', '#28a745');
            setTimeout(function() {
                $(this).text(originalText).css('color', '');
            }.bind(this), 2000);
        }
    });

    // clipboard
    if (window.location.href.indexOf('download') > -1 ) {


        (function() {
            var copylinkbtn = document.getElementById('copy-link-btn'),
                copylink = document.getElementById('copy-link-wrapper'),
                overlay = document.getElementById('overlay');

            var url = 'http://url';
            copylinkbtn.addEventListener('click', function() {

                var error = document.getElementsByClassName('error');

                while (error[0]) {
                    error[0].parentNode.removeChild(error[0]);
                }

                document.body.className += ' active';

                copylink.children[1].value = url;
                copylink.children[1].focus();
                copylink.children[1].select();
            }, false);

            overlay.addEventListener('click', function() {
                document.body.className = '';
            }, false);

            copylink.children[1].addEventListener('keydown', function(e) {

                var error = document.getElementsByClassName('error');

                while (error[0]) {
                    error[0].parentNode.removeChild(error[0]);
                }

                setTimeout(function() {

                    if ((e.metaKey || e.ctrlKey) && e.keyCode === 67 && isTextSelected(copylink.children[2])) {
                        document.body.className = '';
                    } else if ((e.metaKey || e.ctrlKey) && e.keyCode === 67 && isTextSelected(copylink.children[2]) === false) {
                        var error = document.createElement('span');
                        error.className = 'error';
                        var errortext = document.createTextNode('The link was not copied, make sure the entire text is selected.');

                        error.appendChild(errortext);
                        copylink.appendChild(error);
                    }
                }, 100);

                function isTextSelected(input) {
                    if (typeof input.selectionStart === 'number') {
                        return input.selectionStart === 0 && input.selectionEnd === input.value.length;
                    } else if (typeof document.selection !== 'undefined') {
                        input.focus();
                        return document.selection.createRange().text === input.value;
                    }
                }
            }, false);
        })();
    }

})();
