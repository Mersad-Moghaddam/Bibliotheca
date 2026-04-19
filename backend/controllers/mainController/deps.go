package mainController

import (
	"context"

	"negar-backend/controllers/authController"
	"negar-backend/controllers/bookController"
	"negar-backend/controllers/readingController"
	"negar-backend/controllers/userController"
	"negar-backend/controllers/wishlistController"
	"negar-backend/repositories"
	"negar-backend/services/auditService"
	"negar-backend/services/authService"
	"negar-backend/services/bookService"
	"negar-backend/services/readingService"
	"negar-backend/services/runtimecheck"
	"negar-backend/services/wishlistService"
	"negar-backend/statics/configs"
)

type ReadinessChecker interface {
	Check(ctx context.Context) error
}

type ControllerDeps struct {
	Main     *MainService
	Auth     *authController.ServiceBridge
	Book     *bookController.ServiceBridge
	Reading  *readingController.ServiceBridge
	User     *userController.ServiceBridge
	Wishlist *wishlistController.ServiceBridge
}

func DepsFromInitialRepositories(ir *repositories.InitialRepositories, cfg *configs.Config) ControllerDeps {
	authSvc := authService.New(ir.User, ir.Auth, cfg.JWTSecret, cfg.AccessTokenTTL, cfg.RefreshTokenTTL, cfg.RateLimitWindow, cfg.RateLimitMaxAttempts)
	userSvc := authService.NewUserService(ir.User)
	auditSvc := auditService.New(ir.Audit)
	bookSvc := bookService.New(ir.Book)
	readSvc := readingService.New(ir.Reading)
	wishSvc := wishlistService.New(ir.Wishlist, ir.PurchaseLink)
	readiness := runtimecheck.New(ir.DB(), ir.Redis())

	return ControllerDeps{
		Main:     &MainService{books: bookSvc, reading: readSvc, users: userSvc, readiness: readiness},
		Auth:     &authController.ServiceBridge{Auth: authSvc, User: userSvc},
		Book:     &bookController.ServiceBridge{Book: bookSvc, Audit: auditSvc},
		Reading:  &readingController.ServiceBridge{Reading: readSvc, Audit: auditSvc},
		User:     &userController.ServiceBridge{User: userSvc, Audit: auditSvc},
		Wishlist: &wishlistController.ServiceBridge{Wishlist: wishSvc, Audit: auditSvc},
	}
}
