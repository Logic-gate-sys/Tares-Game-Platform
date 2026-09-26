FROM golang:1.26-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/wss-service .

FROM alpine:3.22
RUN adduser -D -H -u 10001 app
WORKDIR /app
COPY --from=builder /out/wss-service /app/wss-service
USER app
EXPOSE 8081
ENTRYPOINT ["/app/wss-service"]
