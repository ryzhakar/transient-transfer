# Transfer.sh Web Interface - Product Requirements

## Target User

**Primary Persona**: Gen-Z content creator/social media manager
- Age: 22-28
- Context: Underpaid, overworked, constantly switching between devices
- Frustration: Tired of bloated interfaces and unnecessary complexity
- Need: Quick, reliable file sharing for work deliverables
- Expectation: Modern, trustworthy interface that "just works"

## Core User Stories

### File Upload Stories

**As a content creator, I want to upload files quickly so I can share work with clients immediately.**
- I can drag files directly onto the page
- I can click to browse and select files
- I can see upload progress for large video files
- I can upload multiple files at once
- The interface works the same on my phone and laptop

**As a social media manager, I want to share multiple campaign assets as one link so clients can download everything easily.**
- I can select multiple files and get one ZIP download link
- The ZIP link is automatically generated
- I can copy the link with one click

### File Management Stories

**As a freelancer, I want to remove files I've shared so sensitive client work doesn't stay online.**
- I can delete files I've uploaded with one click
- Files are immediately removed from the server
- I don't need to save deletion tokens manually

**As a content creator, I want to see what I've uploaded so I can manage my shared files.**
- I can see a list of files I've uploaded in this session
- I can copy links for previously uploaded files
- I can remove files from my upload list

### File Download Stories

**As a client receiving files, I want to download files immediately so I can review work quickly.**
- I can click one button to download any file
- Large files download directly without preview delays
- I can copy the share link to send to others
- Media files show a preview before download

**As a team member, I want to view shared images/videos in my browser so I can provide feedback without downloading.**
- Images display in the browser immediately
- Videos play with standard browser controls
- Audio files play with standard browser controls

### Trust and Reliability Stories

**As a professional user, I want the interface to look trustworthy so I feel confident sharing it with clients.**
- The design looks modern and professional
- The interface feels stable and reliable
- Loading states are clear and informative

**As a mobile user, I want the interface to work perfectly on my phone so I can share files anywhere.**
- All functionality works on mobile browsers
- Touch interactions are responsive
- Text is readable without zooming

## Technical Requirements

### Backend Integration
- Must integrate with existing transfer.sh Go server
- Must handle X-Url-Delete response header for file deletion
- Must support batch ZIP download syntax: `/(token1/file1,token2/file2).zip`
- Must serve assets from `styles/` and `scripts/` directories

### File Operations
- Upload: `PUT /{filename}` with progress tracking
- Download: `GET /{token}/{filename}` for preview
- Force Download: `GET /get/{token}/{filename}` for download
- Delete: `DELETE` to URL from X-Url-Delete header
- Batch Download: `GET /(file1,file2).zip`

### Performance Requirements
- First meaningful paint under 2 seconds on 3G
- Interface responsive during large file uploads
- Works without JavaScript for basic functionality
- File uploads resume after network interruption

### Compatibility Requirements
- Works in all browsers from last 3 years
- Fully accessible via keyboard navigation
- Screen reader compatible
- Works on iOS Safari and Android Chrome

## Success Metrics

### Primary Metrics
- Time from file selection to shareable link: <10 seconds
- Upload completion rate: >95% on mobile networks
- User task completion without help/documentation: >90%

### Secondary Metrics
- Page load time on 3G: <2 seconds
- Accessibility score: WCAG AA compliant
- Mobile usability score: >90 (Google PageSpeed)

## Anti-Requirements

### What This Is NOT
- File storage service (files expire automatically)
- Collaboration platform with comments/reviews
- Media editing or processing tool
- Social sharing platform
- Enterprise file management system

### What We Will NOT Build
- User accounts or authentication
- File organization/folders
- File versioning
- Custom sharing permissions
- Built-in virus scanning UI
- Email/notification systems
- File previews for complex formats (PDFs, documents)

## Edge Cases to Handle

### Network Issues
- Upload interruption and resume
- Slow connection timeouts
- Offline state handling

### File Issues
- Large file uploads (>500MB)
- Special characters in filenames
- Unsupported file types
- Empty files

### User Issues
- Accidental file deletion
- Lost share links
- Multiple browser tabs
- Browser refresh during upload

## Content Strategy

### Messaging Principles
- Task-focused: "Upload files" not "Share your creativity"
- Direct: "Copy link" not "Get shareable URL"
- Honest: "Files expire in N days" upfront
- Minimal: No marketing copy or feature explanations

### Error Messages
- Clear action to take: "Check connection and try again"
- No technical jargon: "Upload failed" not "Network timeout"
- Immediate: Show errors as they happen

## Next Implementation Approach

1. **Start with HTML semantics** - Build working forms first
2. **Add progressive enhancement** - Layer CSS and JS on top
3. **Test on real devices** - Validate mobile experience early
4. **Optimize for perceived performance** - Focus on loading states
5. **Validate with real users** - Test with actual content creators

The implementation should prioritize user needs over technical elegance. Every feature must serve the core workflow: upload → share → done.
