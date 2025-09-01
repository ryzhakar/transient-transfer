FROM node:18-alpine AS builder

RUN apk add --no-cache \
    git python3 make g++ autoconf automake libtool \
    pkgconfig zlib-dev libpng-dev jpeg-dev giflib-dev go
RUN npm install -g grunt-cli bower
RUN go install github.com/shuLhan/go-bindata/...@latest && \
    cp ~/go/bin/go-bindata /usr/local/bin/ || \
    cp /root/go/bin/go-bindata /usr/local/bin/ || \
    find / -name "go-bindata" -type f 2>/dev/null | head -1 | xargs -I {} cp {} /usr/local/bin/

WORKDIR /app

COPY package.json bower.json .bowerrc go.mod go.sum ./
RUN npm install --legacy-peer-deps
RUN bower install --allow-root
COPY Gruntfile.js ./
RUN grunt build:deps || grunt build:deps --force

# Source files
COPY src ./src
COPY bindata.go ./
CMD grunt build:assets && go generate .