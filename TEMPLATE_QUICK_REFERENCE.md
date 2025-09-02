# Template Variables - Quick Reference

## 🌐 Always Available (Global)
```html
{{.Hostname}}     <!-- "localhost:8080" -->
{{.WebAddress}}   <!-- "http://localhost:8080/" -->
```

## 📁 File Context (Download Pages)
```html
{{.Filename}}       <!-- "document.pdf" -->
{{.ContentType}}    <!-- "application/pdf" -->
{{.ContentLength}}  <!-- 1048576 -->
{{.URL}}           <!-- "/abc123/document.pdf" (preview) -->
{{.URLGet}}        <!-- "/get/abc123/document.pdf" (download) -->
{{.QRCode}}        <!-- "iVBORw0KGgo..." (base64 image) -->
{{.DeletionToken}} <!-- "def456" -->
```

## 📝 Special Content
```html
{{.Content}}       <!-- Rendered markdown HTML -->
```

## ⚙️ Optional Configuration
```html
{{.GAKey}}         <!-- Google Analytics ID -->
{{.MaxUploadSize}} <!-- "1GB" -->
{{.PurgeTime}}     <!-- "30 days" -->
{{.SampleToken}}   <!-- "abc123" -->
{{.SampleToken2}}  <!-- "def456" -->
```

## 🔧 Filters
```html
{{.ContentLength | format "#,###."}}  <!-- 1,048,576 -->
```

## 📋 Template Mapping
- `index.html` → Global only
- `download.html` → Global + File
- `download.image.html` → Global + File (uses `{{.URL}}` for preview)
- `download.video.html` → Global + File (uses `{{.URL}}` for preview)
- `download.audio.html` → Global + File (uses `{{.URL}}` for preview)
- `download.markdown.html` → Global + File + Content
- `includes/*.html` → Usually Global only

## 🎯 Common Patterns
```html
<!-- Page title -->
<title>{{.Filename}} - {{.Hostname}}</title>

<!-- File metadata -->
<span>{{.ContentType}} · {{.ContentLength | format "#,###."}} bytes</span>

<!-- Preview vs Download -->
<img src="{{.URL}}" alt="{{.Filename}}">     <!-- Preview -->
<a href="{{.URLGet}}">Download</a>           <!-- Force download -->

<!-- Conditional features -->
{{if .GAKey}}
    <!-- Analytics code -->
{{end}}
```
