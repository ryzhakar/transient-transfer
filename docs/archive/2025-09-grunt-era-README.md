> ARCHIVED: describes the deleted grunt/bower pipeline (pre feat/strip-out-junk). Kept for history; do not follow.

# transfer.sh-web

This repository contains the web frontend for [transfer.sh](https://github.com/dutchcoders/transfer.sh/), redesigned following **Dieter Rams design principles** for pure functionality in elegant form.

## ✨ Features

- **Watchface-precision file management** - Upload, manage, delete files in one interface
- **Real-time upload progress** - Pause, resume, and track large file uploads
- **Batch operations** - Download multiple files as ZIP, clear all with one click
- **Clean preview pages** - Auto-download with media preview for images, videos, audio
- **Rams-inspired aesthetic** - Typographic excellence, mathematical spacing, minimal form

## 🚀 Quick Start

### Docker Development
```bash
# Build assets
docker compose run --rm builder

# Start application  
docker compose up
```

### Manual Setup

#### Requirements
- Node.js & NPM
- Grunt CLI (`npm install -g grunt-cli`)
- Bower (`npm install -g bower`)
- Go & go-bindata

#### Installation
```bash
# Install dependencies
npm install
bower install

# Build assets
grunt build
go generate .
```

#### Verify
You should see a `dist/` directory with compiled assets.

## 🏗️ Architecture

### Design System
- **Typography**: System fonts, grotesque precision
- **Spacing**: 4px mathematical grid system  
- **Colors**: Monochrome with functional accents
- **Interactions**: Under 200ms, purposeful feedback

### File Structure
```
src/
├── index.html              # Upload interface
├── download.*.html         # Preview templates  
├── scripts/base.js         # Vanilla JavaScript (no jQuery)
├── styles/
│   ├── config.less         # Rams design variables
│   └── includes/           # Modular LESS files
└── includes/               # HTML components
```

### Key Capabilities
- **Upload**: Drag & drop, browse, paste support
- **Progress**: Real-time tracking with pause/resume
- **Management**: Queue-based file operations
- **Preview**: Type-specific templates (image, video, audio)
- **Download**: Individual links or batch ZIP generation

## 📖 Documentation

- **[WEBAPP_MECHANICS.md](WEBAPP_MECHANICS.md)** - Complete system mechanics
- **[TEMPLATE_VARIABLES.md](TEMPLATE_VARIABLES.md)** - Go template documentation
- **[TEMPLATE_QUICK_REFERENCE.md](TEMPLATE_QUICK_REFERENCE.md)** - Developer quick reference

## 🎯 Server Integration

The frontend expects these transfer.sh server endpoints:
```
PUT /{filename}                 # File upload
GET /{token}/{filename}         # File preview  
GET /get/{token}/{filename}     # Forced download
DELETE /{url}/{token}           # File deletion
GET /({files}).zip              # Batch download
```

### Template Variables
The Go backend provides variables like:
- `{{.Filename}}`, `{{.ContentType}}`, `{{.ContentLength}}`
- `{{.URL}}`, `{{.URLGet}}`, `{{.DeletionToken}}`
- `{{.Hostname}}`, `{{.QRCode}}`

## 🔧 Build System

### Grunt Tasks
- **LESS compilation** - `main.less` → `main.css` (8.34kB minified)
- **JavaScript concatenation** - Vendor + custom code
- **HTML processing** - Include template resolution
- **Asset optimization** - Minification and copying

### Development Workflow
```bash
# Quick iteration (recommended)
docker compose run --rm builder

# Full rebuild
docker compose down && docker compose up --build
```

## 🎨 Design Philosophy

Following **Dieter Rams' 10 principles**:

1. **Innovative** - Single-interface file management  
2. **Useful** - Every element serves file sharing
3. **Aesthetic** - Beauty through mathematical precision
4. **Understandable** - Self-evident interactions
5. **Unobtrusive** - Interface disappears during use
6. **Honest** - No dark patterns or hidden complexity
7. **Long-lasting** - System fonts, semantic HTML, future-proof
8. **Thorough** - Every detail considered and refined  
9. **Environmentally-friendly** - Minimal bandwidth, efficient code
10. **As little design as possible** - Maximum function, minimum form

## 🏆 Performance

- **CSS**: 87% size reduction (6.79kB → 5.55kB minified)
- **JavaScript**: Pure vanilla (no framework overhead)
- **Dependencies**: Self-contained, no external CDNs
- **Loading**: Optimized assets, minimal HTTP requests

## 🔒 Security

- Automatic HTML escaping in templates
- Token-based file deletion
- XSS prevention through proper URL handling
- No sensitive data in client-side code

---

**"Weniger, aber besser"** - *Less, but better.*

This transfer.sh frontend embodies Rams' philosophy: pure functionality in elegant form, with watchface precision and unobtrusive design.
