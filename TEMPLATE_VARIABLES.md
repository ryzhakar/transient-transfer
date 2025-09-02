# Transfer.sh Web Template Variables - Comprehensive Documentation

This document provides complete documentation of all Go template variables available in the transfer.sh web frontend, organized by context and usage.

## Table of Contents

1. [Variable Categories](#variable-categories)
2. [Global Variables](#global-variables)
3. [File Context Variables](#file-context-variables)
4. [Content Variables](#content-variables)
5. [Configuration Variables](#configuration-variables)
6. [Template Filters](#template-filters)
7. [Usage by Template](#usage-by-template)
8. [Backend Integration](#backend-integration)
9. [Examples](#examples)

## Variable Categories

### 🌐 Global Variables
Available in **all** templates across the application.

### 📁 File Context Variables
Available in download/preview templates when a specific file is being accessed.

### 📝 Content Variables
Available in specialized templates for specific file types.

### ⚙️ Configuration Variables
Optional variables that may be provided based on server configuration.

---

## Global Variables

These variables are available in **every template** throughout the application:

| Variable | Type | Description | Example Value |
|----------|------|-------------|---------------|
| `{{.Hostname}}` | `string` | Service hostname/domain | `"localhost:8080"` |
| `{{.WebAddress}}` | `string` | Base web address with protocol | `"http://localhost:8080/"` |

### Usage Context
- **Homepage**: Site branding, example URLs
- **Download pages**: Site identification
- **Navigation**: Service name display
- **Footer**: Branding elements
- **Documentation**: Command-line examples

---

## File Context Variables

These variables are available when accessing a **specific uploaded file** (download/preview pages):

| Variable | Type | Description | Example Value | Notes |
|----------|------|-------------|---------------|-------|
| `{{.Filename}}` | `string` | Original uploaded filename | `"document.pdf"` | Used for page titles, display |
| `{{.ContentType}}` | `string` | MIME type of the file | `"application/pdf"` | Determines template selection |
| `{{.ContentLength}}` | `int64` | File size in bytes | `1048576` | Often formatted with filters |
| `{{.URL}}` | `string` | Direct file access URL | `"http://localhost:8080/abc123/document.pdf"` | For inline viewing/preview |
| `{{.URLGet}}` | `string` | Download endpoint URL | `"http://localhost:8080/get/abc123/document.pdf"` | Forces download |
| `{{.QRCode}}` | `string` | Base64 encoded QR code image | `"iVBORw0KGgoAAAANSUhEUgAA..."` | For mobile access |
| `{{.DeletionToken}}` | `string` | Token for file deletion | `"def456"` | Used with DELETE requests |

### URL Structure Explained

```
Direct Access:    {{.URL}}    = /abc123/document.pdf
Download Force:   {{.URLGet}} = /get/abc123/document.pdf
Deletion:         DELETE {{.URL}}/{{.DeletionToken}}
```

### File Type Detection

The server routes to different templates based on `{{.ContentType}}`:

- `image/*` → `download.image.html`
- `video/*` → `download.video.html`
- `audio/*` → `download.audio.html`
- `text/markdown` → `download.markdown.html`
- Default → `download.html`

---

## Content Variables

### Markdown Content

Available in `download.markdown.html`:

| Variable | Type | Description | Example Value |
|----------|------|-------------|---------------|
| `{{.Content}}` | `string` | Rendered HTML from markdown | `"<h1>Title</h1><p>Content...</p>"` |

### Usage
The server processes markdown files and provides the rendered HTML content for display.

---

## Configuration Variables

These variables are **optional** and depend on server configuration:

| Variable | Type | Description | Default | Usage |
|----------|------|-------------|---------|--------|
| `{{.GAKey}}` | `string` | Google Analytics tracking ID | `""` | Analytics integration |
| `{{.MaxUploadSize}}` | `string` | Maximum upload size limit | `nil` | User guidance |
| `{{.PurgeTime}}` | `string` | File retention period | `nil` | User information |
| `{{.SampleToken}}` | `string` | Example token for documentation | `"abc123"` | Help/examples |
| `{{.SampleToken2}}` | `string` | Second example token | `"def456"` | Help/examples |

### Conditional Usage

```html
<!-- Only show if configured -->
{{if .MaxUploadSize}}
    <p>Maximum file size: {{.MaxUploadSize}}</p>
{{end}}

{{if .GAKey}}
    <script>
        // Google Analytics code
        var gaKey = "{{.GAKey}}";
    </script>
{{end}}
```

---

## Template Filters

The Go `html/template` package provides these filters:

### Number Formatting

| Filter | Usage | Description | Example |
|--------|-------|-------------|---------|
| `format "#,###."` | `{{.ContentLength \| format "#,###."}}` | Adds thousand separators | `1048576` → `"1,048,576"` |

### HTML Safety

All variables are automatically HTML-escaped for security. For raw HTML (like `{{.Content}}`), use `{{.Content \| html}}` if needed.

---

## Usage by Template

### Homepage Templates

#### `index.html`
```html
<title>{{.Hostname}} - File sharing</title>
<!-- Service branding only -->
```

#### `index.txt` (CLI help)
```bash
$ curl --upload-file ./hello.txt {{.WebAddress}}hello.txt
$ curl {{.WebAddress}}{{.SampleToken}}/test.txt
```

### Download Templates

#### `download.html` (Generic files)
```html
<title>{{.Filename}} - {{.Hostname}}</title>
<h1>{{.Filename}}</h1>
<div class="meta">{{.ContentType}} · {{.ContentLength | format "#,###."}} bytes</div>
<a href="{{.URLGet}}">Download</a>
```

#### `download.image.html` (Images)
```html
<img src="{{.URL}}" alt="{{.Filename}}">
<a href="{{.URLGet}}">Download</a>
<!-- Uses {{.URL}} for preview, {{.URLGet}} for download -->
```

#### `download.video.html` (Videos)
```html
<video controls>
    <source src="{{.URL}}" type="{{.ContentType}}">
</video>
<a href="{{.URLGet}}">Download</a>
```

#### `download.audio.html` (Audio)
```html
<audio controls>
    <source src="{{.URL}}" type="{{.ContentType}}">
</audio>
<a href="{{.URLGet}}">Download</a>
```

#### `download.markdown.html` (Markdown)
```html
<div id="md-preview">{{.Content}}</div>
<a href="{{.URLGet}}">Download</a>
<!-- Uses pre-rendered {{.Content}} -->
```

### Include Templates

#### `includes/navigation.html`
```html
<h1>{{.Hostname}}</h1>
<!-- Site branding in navigation -->
```

#### `includes/footer.html`
```html
<p class="footer-brand">{{.Hostname}}</p>
<!-- Site branding in footer -->
```

#### `includes/ga.html` (Analytics)
```html
{{if .GAKey}}
<script>
    var gaKey = "{{.GAKey}}";
    // Analytics initialization
</script>
{{end}}
```

---

## Backend Integration

### Variable Population Flow

1. **Request arrives** at transfer.sh Go server
2. **Route handler** determines template and context:
   - Homepage → Global variables only
   - File access → File + Global variables
   - Special content → Content + File + Global variables
3. **Template execution** with variable substitution
4. **Response sent** with processed HTML

### Server-Side Logic

```go
// Simplified example of server-side template data
type TemplateData struct {
    // Global variables
    Hostname   string
    WebAddress string
    
    // File context (when applicable)
    Filename      string
    ContentType   string
    ContentLength int64
    URL           string
    URLGet        string
    QRCode        string
    DeletionToken string
    
    // Content (for specific types)
    Content string
    
    // Configuration (optional)
    GAKey         string
    MaxUploadSize string
    PurgeTime     string
    SampleToken   string
    SampleToken2  string
}
```

### HTTP Headers Integration

The server also provides data via HTTP headers:

- `X-Url-Delete`: Contains full deletion URL
- Standard content headers for file metadata

---

## Examples

### Complete File Download Page

```html
<!doctype html>
<html>
<head>
    <title>{{.Filename}} - {{.Hostname}}</title>
    <meta name="description" content="Download {{.Filename}}">
</head>
<body>
    <nav>
        <h1>{{.Hostname}}</h1>
    </nav>
    
    <main>
        <h1>{{.Filename}}</h1>
        <div class="file-meta">
            <span>{{.ContentType}}</span>
            <span>{{.ContentLength | format "#,###."}} bytes</span>
        </div>
        
        <!-- Preview for images -->
        {{if eq .ContentType "image/jpeg"}}
            <img src="{{.URL}}" alt="{{.Filename}}">
        {{end}}
        
        <!-- Download actions -->
        <div class="actions">
            <a href="{{.URLGet}}" class="btn-primary">Download</a>
            <button onclick="deleteFile('{{.DeletionToken}}')">Delete</button>
        </div>
        
        <!-- QR Code for mobile -->
        <details>
            <summary>QR Code</summary>
            <img src="data:image/png;base64,{{.QRCode}}" alt="QR Code">
        </details>
    </main>
    
    <footer>
        <p>{{.Hostname}}</p>
    </footer>
</body>
</html>
```

### Conditional Configuration Display

```html
<div class="service-info">
    <h2>{{.Hostname}}</h2>
    
    {{if .MaxUploadSize}}
        <p>Maximum file size: {{.MaxUploadSize}}</p>
    {{end}}
    
    {{if .PurgeTime}}
        <p>Files are kept for: {{.PurgeTime}}</p>
    {{end}}
    
    <p>Upload URL: {{.WebAddress}}</p>
</div>
```

### CLI Help with Examples

```text
{{.Hostname}}: Easy file sharing from the command line

Upload:
$ curl --upload-file ./hello.txt {{.WebAddress}}hello.txt

Download:
$ curl {{.WebAddress}}{{.SampleToken}}/hello.txt

Delete:
$ curl -X DELETE {{.WebAddress}}{{.SampleToken}}/hello.txt/{{.SampleToken2}}
```

---

## Best Practices

### Security
- All variables are automatically HTML-escaped
- Never trust user-provided filenames without validation
- Use `{{.URLGet}}` for forced downloads to prevent XSS

### Performance
- QR codes are pre-generated server-side
- Use conditional rendering for optional features
- Cache templates when possible

### UX
- Always provide `{{.Filename}}` in page titles
- Show file metadata (`{{.ContentType}}`, `{{.ContentLength}}`)
- Use appropriate preview methods (`{{.URL}}` vs `{{.URLGet}}`)

### Maintenance
- Document custom template variables if extending
- Use consistent variable naming across templates
- Test with various file types and configurations

---

## Summary

The transfer.sh template system provides:

- **7 core file variables** for download/preview functionality
- **2 global variables** for site branding and navigation
- **1 content variable** for specialized file types
- **5 configuration variables** for optional features
- **1 formatting filter** for number display
- **Automatic HTML escaping** for security

This comprehensive system enables rich, dynamic file sharing interfaces while maintaining security and performance.
