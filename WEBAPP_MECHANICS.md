# Transfer.sh Web UI - Technical Mechanics & Logic

## Overview
This document describes the complete mechanics and logic of the transfer.sh web interface. The webapp provides a clean, functional file transfer interface with upload, download, preview, and deletion capabilities, built following Dieter Rams design principles.

## Architecture

### File Structure
```
src/
├── index.html                    # Main landing page with upload interface
├── index.txt                     # CLI help documentation
├── download.*.html              # File preview templates (image, video, audio, markdown)
├── 404.html                     # Error page
├── includes/                    # Reusable HTML components
│   ├── head.html               # Main page metadata
│   ├── navigation.html         # Site navigation
│   ├── footer.html             # Site footer
│   ├── js.html                 # JavaScript includes
│   ├── download-head.html      # Download page metadata
│   ├── download-navigation.html # Download page navigation
│   ├── download-top.html       # Download page content (legacy)
│   ├── download-delete.html    # Deletion interface (legacy)
│   └── ga.html                 # Google Analytics (optional)
├── scripts/
│   └── base.js                 # Core JavaScript functionality
├── styles/
│   ├── main.less               # Main stylesheet entry point
│   ├── config.less             # Design system variables
│   └── includes/
│       ├── global.less         # Global styles and typography
│       ├── home.less           # Upload interface styling
│       ├── pages.less          # Download page styling (minimal)
│       └── video-js.less       # Media player styling (minimal)
└── images/                     # Essential UI assets
```

### Template System
The webapp uses a simple include-based templating system processed by Grunt:
- `include "includes/filename.html"` statements are replaced with file contents during build
- Go templates with `{{.Variable}}` syntax are processed by the transfer.sh backend
- Templates are processed during build to generate final HTML files in `dist/`

## Core Functionality

### 1. File Upload System

#### Upload Methods
1. **Drag & Drop**: Files dragged onto the upload area
2. **File Browse**: Click "choose files" link to open file picker
3. **Clipboard Paste**: Paste files directly from clipboard (images/files)

#### Upload Logic (`base.js`)
```javascript
function addFilesToQueue(files) {
    // Creates file queue UI elements
    // Sets up XMLHttpRequest with progress tracking
    // Uploads via PUT request to `/${filename}`
    // Tracks upload progress and status
    // Handles pause/resume functionality
    // Updates batch download links automatically
}
```

#### Key Features
- **Real-time Progress Tracking**: 2px progress bars with percentage display
- **Pause/Resume**: Full upload control for large files
- **Queue Management**: Multiple file uploads with visual status indicators
- **Batch Downloads**: Automatic ZIP generation for multiple files
- **Deletion Management**: Automatic server cleanup when files removed from queue
- **Status Indicators**: Color-coded visual feedback (uploading, completed, error, paused)

#### Upload States
- **Queued**: File added to upload queue
- **Uploading**: Active upload with progress tracking
- **Paused**: Upload temporarily suspended (resumable)
- **Completed**: Upload finished successfully
- **Error**: Upload failed with error indication

### 2. File Download & Preview System

#### Download Templates
- `download.html` - Generic file download with auto-download countdown
- `download.image.html` - Image preview with inline display
- `download.video.html` - Video preview with HTML5 video player
- `download.audio.html` - Audio preview with HTML5 audio player
- `download.markdown.html` - Markdown content preview (legacy)
- `download.sandbox.html` - Sandboxed content preview (legacy)

#### Template Variables
All download templates receive these Go template variables:

**Core File Variables:**
- `{{.Filename}}` - Original uploaded filename
- `{{.ContentType}}` - MIME type of the file
- `{{.ContentLength}}` - File size in bytes (use with `| format "#,###."`)
- `{{.URL}}` - Direct file access URL (for preview/inline viewing)
- `{{.URLGet}}` - Download endpoint URL (forces download)
- `{{.QRCode}}` - Base64 encoded QR code for mobile access
- `{{.DeletionToken}}` - Token for file deletion

**Global Variables:**
- `{{.Hostname}}` - Service hostname
- `{{.WebAddress}}` - Base web address

**Content Variables:**
- `{{.Content}}` - Rendered markdown HTML (markdown files only)

**Configuration Variables (Optional):**
- `{{.GAKey}}` - Google Analytics tracking ID
- `{{.MaxUploadSize}}` - Upload size limit
- `{{.PurgeTime}}` - File retention period
- `{{.SampleToken}}`, `{{.SampleToken2}}` - Example tokens for documentation

### 3. File Deletion System

#### Current Implementation
- **Queue-based deletion**: Files can be deleted directly from upload queue
- **Automatic cleanup**: Server files deleted when removed from queue
- **Token-based deletion**: Uses deletion tokens from upload response
- **Header-based URLs**: Prefers `X-Url-Delete` header when available

#### Deletion Logic (`base.js`)
```javascript
function deleteFile(fileId) {
    // Cancel upload if in progress
    // Delete from server using deletion URL or token
    // Remove from local queue
    // Update UI display
}
```

#### Deletion Methods
1. **X-Url-Delete Header**: Uses deletion URL from server response header
2. **Token-based**: Constructs deletion URL using `{{.URL}}/{{.DeletionToken}}`
3. **Batch deletion**: Clear all files from queue and server

### 4. Navigation & UI Components

#### Main Navigation (`includes/navigation.html`)
- Minimal site branding with `{{.Hostname}}`
- Clean typography following Rams principles
- No promotional content

#### Upload Interface (`index.html`)
- Single upload area with drag & drop support
- File queue with real-time status updates
- Batch action controls (download all, clear all)
- Watchface-inspired typography and spacing

#### Download Pages
- Clean file presentation with metadata
- Auto-download functionality with countdown
- Appropriate preview methods based on file type
- Minimal, functional button controls

## JavaScript Architecture

### Core Script: `base.js`

#### Global Variables
```javascript
const fileQueue = [];           // Tracks all uploaded files
const activeUploads = new Map(); // Tracks active XMLHttpRequest objects
```

#### Event Handlers
- **Drag Events**: `dragenter`, `dragover`, `dragleave`, `drop`
- **File Input**: Change event on hidden file input
- **Paste Events**: Clipboard file paste support
- **Upload Control**: Pause, resume, delete actions
- **Batch Actions**: Download all, clear all functionality

#### Upload Queue Management
- Prevents page unload during active uploads
- Tracks XMLHttpRequest objects for pause/resume
- Removes completed uploads from active tracking
- Updates batch download URLs automatically
- Provides real-time progress feedback

#### Key Functions
- `addFilesToQueue()` - Process new file uploads
- `startUpload()` - Begin file upload with progress tracking
- `pauseUpload()` / `resumeUpload()` - Upload control
- `deleteFile()` - Remove files with server cleanup
- `updateFileElement()` - UI status updates
- `downloadAll()` - Batch download functionality

### Dependencies
**Removed Dependencies:**
- jQuery (replaced with vanilla JavaScript)
- Bootstrap JS (removed)
- URI.js (replaced with native URL handling)
- Video.js (minimal self-contained implementation)

**Current Implementation:**
- Pure vanilla JavaScript
- Native DOM manipulation
- Modern browser APIs (File API, Clipboard API, XMLHttpRequest Level 2)

## CSS/Styling Architecture

### LESS Structure
```
styles/
├── main.less              # Main import file (minimal imports)
├── config.less            # Design system variables (Rams-inspired)
└── includes/
    ├── global.less        # Global styles and typography
    ├── home.less          # Upload interface styling
    ├── pages.less         # Download page styling (minimal)
    ├── video-js.less      # Media player styling (minimal)
    ├── transfersh-icons.less # Empty (icons removed)
    └── filetype-icons.less   # Empty (icons removed)
```

### Design System (Rams Principles)

#### Typography
- **Font Stack**: `-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif`
- **Monospace**: `'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace`
- **Scale**: Mathematical progression (10px to 48px)
- **Weight**: Light (200-300) for headings, regular (400) for body

#### Color Palette
- **Monochrome**: Pure black/white with precise gray scale
- **Functional**: Minimal color usage (only for state indication)
- **Interaction**: Black/white inversion on hover

#### Spacing System
- **Base Unit**: 4px grid system
- **Progression**: 2px, 4px, 6px, 8px, 10px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px
- **Mathematical**: Consistent ratios throughout interface

#### Layout
- **Container**: 800px max-width with responsive padding
- **Grid**: CSS Grid for file queue layout
- **Flexbox**: Button groups and metadata display

### Key CSS Classes
- `.container` - Centered content container
- `.upload-area` - File drop zone styling
- `.file-queue` - Upload queue list
- `.file-progress` - Upload progress bars
- `.btn`, `.btn-primary`, `.btn-destructive` - Button system
- `.mono` - Monospace text for data display

## Build System

### Grunt Tasks
1. **LESS Compilation**: `main.less` → `main.css` (10.02kB → 8.34kB minified)
2. **JavaScript Concatenation**: Combines vendor + base.js
3. **HTML Processing**: Processes include statements
4. **Minification**: CSS and JS minification
5. **Asset Copying**: Fonts, images, static files

### Build Pipeline
```bash
docker compose run --rm builder  # Build assets in container
docker compose up                # Run application
```

### Dependencies Management
- **NPM**: Package management for build tools
- **Bower**: Legacy dependency management (minimal usage)
- **Docker**: Containerized build environment

## Server Integration

### API Endpoints
- `PUT /{filename}` - File upload endpoint
- `GET /{token}/{filename}` - File access/preview endpoint
- `GET /get/{token}/{filename}` - Forced download endpoint
- `DELETE /{url}/{token}` - File deletion endpoint
- `GET /({token1}/{file1},{token2}/{file2}).zip` - Batch download (ZIP)

### Response Headers
- `X-Url-Delete` - Contains full deletion URL with token
- `Content-Type` - Determines template selection
- `Content-Length` - File size for display
- Standard HTTP status codes for success/error handling

### Template Routing
Server selects templates based on MIME type:
- `image/*` → `download.image.html`
- `video/*` → `download.video.html`
- `audio/*` → `download.audio.html`
- `text/markdown` → `download.markdown.html`
- Default → `download.html`

## Security Considerations

### Client-Side
- No sensitive data stored in JavaScript
- Deletion tokens handled securely
- File type validation through server responses
- Automatic HTML escaping in templates

### Upload Safety
- File uploads use PUT method with filename in URL
- Progress tracking prevents UI blocking
- Queue management prevents resource exhaustion
- XSS prevention through proper URL handling

### Template Security
- All variables automatically HTML-escaped
- `{{.URLGet}}` used for safe downloads
- `{{.URL}}` used carefully for previews only

## Browser Compatibility

### Required Features
- **XMLHttpRequest Level 2** (for upload progress)
- **File API** (for drag & drop)
- **Clipboard API** (for paste functionality)
- **CSS Grid** (for layout)
- **Modern JavaScript** (ES6+ features)

### Graceful Degradation
- File input fallback for drag & drop
- Basic styling without advanced CSS features
- Error handling for unsupported browsers
- Progressive enhancement approach

## Performance Considerations

### Optimizations Applied
- **Minimal CSS**: 8.34kB minified (87% reduction from original)
- **Vanilla JavaScript**: No framework overhead
- **Efficient DOM manipulation**: Minimal reflows/repaints
- **Optimized uploads**: Proper progress tracking and queue management

### Monitoring Points
- Upload queue size and memory usage
- Progress tracking performance
- File preview loading times
- UI responsiveness during operations

## Current Implementation Status

### ✅ Implemented Features
- File upload with drag & drop, browse, paste
- Real-time upload progress with pause/resume
- File queue management with status indicators
- Batch download (ZIP) functionality
- Clean preview pages with auto-download
- Deletion system with token management
- Responsive, accessible design
- Rams-inspired aesthetic principles

### ❌ Removed Features
- jQuery and Bootstrap dependencies
- Icon fonts and decorative elements
- Complex preview modals
- Promotional content and branding
- Legacy video.js integration

### ⚠️ Available but Unused
- QR code display (`{{.QRCode}}`)
- Google Analytics integration (`{{.GAKey}}`)
- Configuration display (`{{.MaxUploadSize}}`, `{{.PurgeTime}}`)
- Markdown content preview (`{{.Content}}`)

## Testing Checklist

### Core Functionality
1. ✅ File upload (drag, browse, paste)
2. ✅ Upload progress tracking
3. ✅ Multiple file uploads
4. ✅ Upload pause/resume
5. ✅ File queue management
6. ✅ Individual file deletion
7. ✅ Batch file operations
8. ✅ Download link copying
9. ✅ Preview page functionality
10. ✅ Auto-download countdown

### UI/UX Testing
1. ✅ Responsive design (mobile/desktop)
2. ✅ Keyboard accessibility
3. ✅ Visual status indicators
4. ✅ Error handling and feedback
5. ✅ Typography and spacing consistency
6. ✅ Button and interaction states

### Browser Testing
1. Modern browsers (Chrome, Firefox, Safari, Edge)
2. Upload progress functionality
3. Drag & drop support
4. Clipboard paste support
5. Media preview capabilities

## Maintenance Notes

### Code Organization
- **Pure functional design**: Every element serves file transfer
- **Rams principles**: "Weniger, aber besser" (Less, but better)
- **Modular architecture**: Clean separation of concerns
- **Minimal dependencies**: Self-contained implementation

### Future Modifications
- **Add file types**: Create new `download.{type}.html` templates
- **Extend functionality**: Modify `base.js` with new features
- **Update styling**: Adjust LESS files for design changes
- **Server integration**: Match expected endpoint patterns

### Documentation Standards
- All template variables documented in `TEMPLATE_VARIABLES.md`
- Quick reference available in `TEMPLATE_QUICK_REFERENCE.md`
- Investigation results in `TEMPLATE_INVESTIGATION_RESULTS.md`
- This mechanics document for overall system understanding

---

*This documentation reflects the current state of the transfer.sh web UI after comprehensive redesign following Dieter Rams design principles. The system prioritizes pure functionality in elegant form, with watchface precision and minimal aesthetic.*