# Transfer.sh Web UI - Technical Mechanics & Logic

## Overview
This document describes the complete mechanics and logic of the transfer.sh web interface after the promotional content stripping. The webapp provides a clean, functional file transfer interface with upload, download, preview, and deletion capabilities.

## Architecture

### File Structure
```
src/
├── index.html                 # Main landing page
├── download.*.html           # File preview templates
├── 404.html                  # Error page
├── includes/                 # Reusable HTML components
├── scripts/base.js           # Core JavaScript functionality
├── styles/                   # LESS/CSS styling
└── images/                   # Essential UI assets
```

### Template System
The webapp uses a simple include-based templating system processed by Grunt:
- `include "includes/filename.html"` statements are replaced with file contents
- Templates are processed during build to generate final HTML files

## Core Functionality

### 1. File Upload System

#### Upload Methods
1. **Drag & Drop**: Files dragged onto the terminal area
2. **File Browse**: Click "click to browse" link to open file picker
3. **Clipboard Paste**: Paste files directly from clipboard

#### Upload Logic (`base.js`)
```javascript
function upload(file) {
    // Creates progress UI element
    // Sets up XMLHttpRequest with progress tracking
    // Uploads via PUT request to `./${filename}`
    // Displays download URL and deletion token on success
    // Updates batch download links (zip/tar.gz)
}
```

#### Key Features
- **Progress Tracking**: Real-time upload progress bar
- **Queue Management**: Multiple file uploads with queue tracking
- **Batch Downloads**: Automatic generation of zip/tar.gz links for multiple files
- **Deletion Tokens**: Each upload returns a deletion token for file management

### 2. File Download & Preview System

#### Download Templates
- `download.html` - Generic file download
- `download.image.html` - Image preview with `<img>` tag
- `download.video.html` - Video preview with Video.js player
- `download.audio.html` - Audio preview with Video.js player
- `download.markdown.html` - Markdown content preview
- `download.sandbox.html` - Sandboxed content preview

#### Template Variables
All download templates receive these Go template variables:
- `{{.URL}}` - Direct file download URL
- `{{.Filename}}` - Original filename
- `{{.ContentType}}` - MIME type
- `{{.ContentLength}}` - File size in bytes
- `{{.QRCode}}` - Base64 encoded QR code for mobile access
- `{{.URLGet}}` - Download endpoint URL

### 3. File Deletion System

#### Deletion Logic (`base.js`)
```javascript
function deleteFile(baseURL) {
    // Shows deletion modal
    // Prompts for deletion token
    // Sends DELETE request to baseURL/token
    // Shows success/error feedback
}
```

#### UI Flow
1. User clicks "delete" button on download page
2. Modal appears requesting deletion token
3. Token validation and DELETE request to server
4. Success/error feedback displayed

### 4. Navigation & UI Components

#### Main Navigation (`includes/navigation.html`)
- Home link
- Sample use cases link
- Simplified structure (promotional links removed)

#### Footer (`includes/footer.html`)
- Minimal branding with `{{.Hostname}}`
- No promotional content

## JavaScript Architecture

### Core Script: `base.js`

#### Global Variables
```javascript
var files = Array();    // Tracks uploaded files for batch downloads
var queue = Array();    // Tracks active upload requests
```

#### Event Handlers
- **Drag Events**: `dragenter`, `dragover`, `dragleave`, `drop`
- **File Input**: Change event on hidden file input
- **Paste Events**: Clipboard file paste support
- **Delete Actions**: Modal management and deletion requests

#### Upload Queue Management
- Prevents page unload during active uploads
- Tracks XMLHttpRequest objects in queue array
- Removes completed uploads from queue
- Updates batch download URLs automatically

### Dependencies
Built JavaScript includes:
1. jQuery (DOM manipulation)
2. URI.js (URL parsing for batch downloads)
3. Bootstrap JS (collapse functionality)
4. Video.js (video/audio preview)
5. Custom base.js (core functionality)

## CSS/Styling Architecture

### LESS Structure
```
styles/
├── main.less              # Main import file
├── config.less            # Variables and configuration
├── bootstrap.less         # Bootstrap framework
└── includes/
    ├── global.less        # Global styles
    ├── home.less          # Landing page styles
    ├── pages.less         # Sample pages styles
    ├── video-js.less      # Video player styles
    ├── transfersh-icons.less # Icon font definitions
    └── preview.less       # Download/preview page styles
```

### Key CSS Classes
- `.terminal` - Terminal-style interface styling
- `.upload-progress` - Upload progress bar
- `.delete-modal` - File deletion modal
- `.preview-image` - Image/video preview container
- `.btn-cta` - Call-to-action buttons
- `.queue` - Upload queue list styling

## Build System

### Grunt Tasks
1. **LESS Compilation**: `main.less` → `main.css`
2. **JavaScript Concatenation**: Combines dependencies + base.js
3. **HTML Processing**: Processes include statements
4. **Minification**: CSS and JS minification
5. **Asset Copying**: Fonts, images, static files

### Build Pipeline
```bash
grunt build:deps    # Install/build dependencies
grunt build        # Full build process
go generate .       # Generate Go bindata
```

## Server Integration

### Expected Endpoints
- `PUT /{filename}` - File upload endpoint
- `GET /{token}/{filename}` - File download endpoint  
- `DELETE /{token}` - File deletion endpoint
- `GET /{token}/{filename}.zip` - Batch download (zip)
- `GET /{token}/{filename}.tar.gz` - Batch download (tar.gz)

### Response Headers
- `X-Url-Delete` - Contains deletion URL with token
- Standard HTTP status codes for success/error handling

### Template Variables
The Go backend provides these template variables:
- `{{.Hostname}}` - Service hostname
- `{{.WebAddress}}` - Base web address
- `{{.SampleToken}}`, `{{.SampleToken2}}` - Example tokens for documentation
- `{{.MaxUploadSize}}` - Upload size limit (optional)
- `{{.PurgeTime}}` - File retention period (optional)

## Security Considerations

### Client-Side
- No sensitive data stored in JavaScript
- Deletion tokens required for file removal
- File type validation through server responses

### Upload Safety
- File uploads use PUT method with filename in URL
- Progress tracking prevents UI blocking
- Queue management prevents resource exhaustion

## Browser Compatibility

### Required Features
- XMLHttpRequest Level 2 (for upload progress)
- File API (for drag & drop)
- Clipboard API (for paste functionality)
- CSS3 (for styling and animations)

### Graceful Degradation
- File input fallback for drag & drop
- Basic styling without CSS3 features
- Error handling for unsupported browsers

## Maintenance Notes

### Code Organization
- All promotional content has been removed
- Core functionality is isolated in `base.js`
- Styling is modular through LESS includes
- HTML templates are minimal and focused

### Future Modifications
- Add new file types by creating `download.{type}.html` templates
- Extend functionality by modifying `base.js`
- Update styling through LESS files
- Server integration requires matching the expected endpoint patterns

### Testing Checklist
1. File upload (drag, browse, paste)
2. Upload progress tracking
3. Multiple file uploads
4. File preview (all types)
5. File deletion with token
6. Batch downloads (zip/tar.gz)
7. Error handling
8. Mobile responsiveness

## Performance Considerations

### Optimizations Applied
- Minified CSS and JavaScript
- Image optimization during build
- Efficient DOM manipulation
- Minimal HTTP requests

### Monitoring Points
- Upload queue size
- Memory usage during large uploads
- Network request efficiency
- UI responsiveness during uploads

---

*This documentation covers the complete web UI mechanics after promotional content removal. All core functionality is preserved and documented for future maintenance and development.*
