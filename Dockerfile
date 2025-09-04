FROM golang:1.21-alpine AS builder

RUN apk add --no-cache git
RUN go install github.com/shuLhan/go-bindata/...@latest

WORKDIR /app

COPY go.mod go.sum bindata.go ./
COPY essential-source ./essential-source

RUN rm -rf dist && \
    mkdir -p dist/styles && \
    cp essential-source/*.html dist/ && \
    cp essential-source/*.txt dist/ && \
    cp essential-source/main.css dist/styles/ && \
    cp essential-source/robots.txt dist/ && \
    go generate .

CMD cp -r dist/* /output/ && cp bindata_gen.go /output/