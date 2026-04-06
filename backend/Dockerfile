FROM golang:1.24-alpine AS build
WORKDIR /app
COPY go.mod .
RUN go mod download
COPY . .
RUN go build -o /bibliotheca ./cmd/api

FROM alpine:3.21
WORKDIR /app
COPY --from=build /bibliotheca /bibliotheca
EXPOSE 8080
CMD ["/bibliotheca"]
