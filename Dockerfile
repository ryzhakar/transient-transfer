# ================================
# Build stage - optimized for caching
# ================================
FROM node:18-alpine AS builder

# Install system dependencies needed for building
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    autoconf \
    automake \
    libtool \
    pkgconfig \
    zlib-dev \
    libpng-dev \
    jpeg-dev \
    giflib-dev \
    go

# Install build tools globally
RUN npm install -g grunt-cli bower

# Install go-bindata tool and add to PATH
RUN go install github.com/shuLhan/go-bindata/...@latest && \
    cp ~/go/bin/go-bindata /usr/local/bin/ || \
    cp /root/go/bin/go-bindata /usr/local/bin/ || \
    find / -name "go-bindata" -type f 2>/dev/null | head -1 | xargs -I {} cp {} /usr/local/bin/

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json bower.json .bowerrc go.mod go.sum ./

# Install npm dependencies (cached unless package.json changes)
RUN npm install --legacy-peer-deps

# Install bower dependencies (cached unless bower.json changes)
RUN bower install --allow-root

# Copy source files (changes here won't invalidate dependency cache)
COPY src ./src
COPY Gruntfile.js bindata.go ./

# Build frontend assets
RUN grunt build || (echo "Grunt build failed, trying with force" && grunt build --force)

# Generate Go bindata from built assets
RUN go generate .

# Verify build output
RUN ls -la dist/ || (echo "dist directory not found" && exit 1)

# ================================
# Final stage - minimal runtime
# ================================
FROM alpine:latest

# Install only runtime dependencies
RUN apk add --no-cache ca-certificates

# Create non-root user
RUN addgroup -g 1001 -S webapp && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G webapp -g webapp webapp

# Set working directory
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/bindata_gen.go ./

# Set proper ownership
RUN chown -R webapp:webapp /app

# Switch to non-root user
USER webapp

# Default command for development (keeps container running)
CMD ["sh", "-c", "echo 'Build complete. Assets available in /app/dist/' && tail -f /dev/null"]
