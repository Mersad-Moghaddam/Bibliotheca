package customErr

import "errors"

var (
	ErrNotFound            = errors.New("not found")
	ErrUnauthorized        = errors.New("unauthorized")
	ErrBadRequest          = errors.New("bad request")
	ErrConflict            = errors.New("conflict")
	ErrRateLimited         = errors.New("rate limited")
	ErrEmailAlreadyExists  = errors.New("email already exists")
	ErrMobileAlreadyExists = errors.New("mobile already exists")
	ErrInvalidCredentials  = errors.New("invalid credentials")
	ErrInvalidRefreshToken = errors.New("invalid refresh token")
)
