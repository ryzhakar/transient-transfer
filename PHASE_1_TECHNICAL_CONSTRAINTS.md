# Phase 1: Technical Constraints

## Browser Support Requirements

### Minimum Supported Browser
**Safari 12 (iOS 12)** - Released September 2018
- **Rationale**: Target user (Maya) uses iPhone 8 with iOS 12
- **Features Available**: ES6, CSS Grid, Flexbox, Fetch API
- **Features NOT Available**: CSS Container Queries, CSS Subgrid, some modern CSS features
- **Testing Required**: Physical device testing on iPhone 8

### Desktop Browser Support
**Chrome 70+, Firefox 63+, Safari 12+, Edge 79+**
- **Rationale**: Covers 95%+ of business users
- **Features Available**: Full modern web platform
- **Graceful Degradation**: Must work without modern features

## Device Performance Constraints

### Slowest Supported Device
**iPhone 8 (2017) with 2GB RAM**
- **CPU**: A11 Bionic (6-core)
- **Memory**: 2GB RAM
- **Storage**: 64GB (base model)
- **Network**: 2G to 5G support required
- **Testing Required**: Real device performance testing

### Performance Budget
**JavaScript Bundle**: <50KB gzipped
- **Current Estimate**: 200KB+ (needs measurement)
- **Target**: 50KB gzipped maximum
- **Strategy**: Vanilla JavaScript only, no external dependencies
- **Measurement**: webpack-bundle-analyzer

**CSS Bundle**: <20KB gzipped
- **Target**: 20KB gzipped maximum
- **Strategy**: Minimal CSS, no external frameworks
- **Measurement**: CSS analysis tools

**Total Page Weight**: <100KB gzipped
- **Target**: 100KB gzipped maximum
- **Includes**: HTML + CSS + JS + images
- **Strategy**: No external assets, minimal images

## Network Performance Constraints

### Slowest Supported Network
**2G Network (50kbps)**
- **Load Time Target**: <3 seconds
- **Measurement Method**: Chrome DevTools Network throttling
- **Real Testing**: WebPageTest from Mumbai/Lagos
- **Strategy**: Critical CSS inlined, minimal JavaScript

### Network Resilience
**Must work on intermittent connections**
- **Upload Resume**: Not required (files are small)
- **Offline Handling**: Graceful degradation
- **Error Recovery**: Clear user guidance
- **Timeout Handling**: Reasonable timeouts with retry options

## Accessibility Requirements

### WCAG Level
**WCAG AAA Compliance Required**
- **Color Contrast**: 7:1 minimum ratio
- **Keyboard Navigation**: Complete workflow accessible
- **Screen Reader**: Full content accessibility
- **Motion Sensitivity**: Respect prefers-reduced-motion
- **Testing Required**: axe-core + manual testing

### Specific Accessibility Constraints
**Keyboard Navigation**
- All functionality accessible via keyboard
- Logical tab order
- Clear focus indicators
- Skip links for main content

**Screen Reader Support**
- Semantic HTML structure
- ARIA labels where needed
- Alternative text for all images
- Form labels properly associated

**Visual Accessibility**
- High contrast mode support
- Scalable text (up to 200%)
- No color-only information
- Clear visual hierarchy

## Security Constraints

### Content Security Policy
**Strict CSP Required**
- **No Inline Scripts**: All JavaScript in external files
- **No Inline Styles**: All CSS in external files
- **No eval()**: No dynamic code execution
- **HTTPS Only**: All resources must be HTTPS

### Data Handling
**No Client-Side Storage of Sensitive Data**
- **File Content**: Never stored in localStorage/sessionStorage
- **URLs**: Can be stored temporarily for UX
- **User Data**: No personal information collection
- **Privacy**: No tracking or analytics without consent

## Performance Constraints

### Core Web Vitals
**Lighthouse Performance Score: >90**
- **LCP (Largest Contentful Paint)**: <2.5 seconds
- **FID (First Input Delay)**: <100ms
- **CLS (Cumulative Layout Shift)**: <0.1
- **Measurement**: Chrome DevTools + PageSpeed Insights

### Loading Performance
**Time to Interactive: <3.8 seconds on slow 3G**
- **First Contentful Paint**: <1.5 seconds
- **First Meaningful Paint**: <2.0 seconds
- **Time to Interactive**: <3.8 seconds
- **Measurement**: Chrome DevTools + WebPageTest

## Browser API Constraints

### Required APIs
**Must work with these APIs**
- **Fetch API**: For file uploads
- **Clipboard API**: For copy functionality
- **File API**: For file selection
- **Drag and Drop API**: For drag upload
- **URL API**: For URL manipulation

### Graceful Degradation
**Must work without these APIs**
- **Intersection Observer**: Not required
- **Resize Observer**: Not required
- **Web Animations API**: Not required
- **Service Workers**: Not required

### Fallback Strategies
**Clipboard API Fallback**
- Use document.execCommand('copy') if Clipboard API unavailable
- Show prompt() as last resort

**Drag and Drop Fallback**
- Standard file input if drag/drop unavailable
- No functionality loss

## Development Constraints

### No External Dependencies
**Vanilla JavaScript Only**
- **No jQuery**: Not needed for this scope
- **No React/Vue/Angular**: Overkill for this interface
- **No CSS Frameworks**: Build custom minimal system
- **No Build Tools**: Keep it simple

### Code Quality
**ES6+ with Babel if needed**
- **Target**: ES2017 for broad compatibility
- **Transpilation**: Only if necessary for browser support
- **Polyfills**: Minimal, only for critical features

## Testing Constraints

### Device Testing Required
**Physical Device Testing**
- **iPhone 8 (iOS 12)**: Primary target device
- **Android Device**: Secondary testing
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Accessibility**: Screen reader testing

### Network Testing Required
**Real Network Conditions**
- **2G Network**: Mumbai/Lagos via WebPageTest
- **3G Network**: Standard mobile testing
- **WiFi**: High-speed testing
- **Intermittent**: Connection drop testing

## Deployment Constraints

### Server Integration
**Must work with existing Go backend**
- **Template Variables**: Use existing {{.Hostname}} etc.
- **API Endpoints**: Use existing PUT/GET/DELETE endpoints
- **Headers**: Use existing X-Url-Delete header
- **File Types**: Support existing file type detection

### Static Asset Serving
**Assets served from /styles/ and /scripts/**
- **CSS**: /styles/main.css
- **JavaScript**: /scripts/main.js
- **Images**: Inline or minimal external images
- **Fonts**: System fonts only

## Summary

**These constraints ensure the interface works reliably for business users on real devices with real network conditions while maintaining professional credibility and accessibility standards.**

**Key Principle**: Every constraint serves user needs, not technical preferences.
