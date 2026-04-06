FROM golang:1.24-alpine AS build
WORKDIR /app
COPY go.mod .
RUN go mod download
COPY . .
RUN go build -o /libro-backend ./cmd/api

FROM alpine:3.21
WORKDIR /app
COPY --from=build /libro-backend /libro-backend
EXPOSE 8080
CMD ["/libro-backend"]
