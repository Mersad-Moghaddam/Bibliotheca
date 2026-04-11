package mainController

import (
	"libro-backend/controllers/authController"
	"libro-backend/controllers/bookController"
	"libro-backend/controllers/readingController"
	"libro-backend/controllers/userController"
	"libro-backend/controllers/wishlistController"
	"libro-backend/repositories"
	"libro-backend/services/authService"
	"libro-backend/services/bookService"
	"libro-backend/services/readingService"
	"libro-backend/services/wishlistService"
	"libro-backend/statics/configs"
)

type ControllerDeps struct {
	Main     *MainService
	Auth     *authController.ServiceBridge
	Book     *bookController.ServiceBridge
	Reading  *readingController.ServiceBridge
	User     *userController.ServiceBridge
	Wishlist *wishlistController.ServiceBridge
}

func DepsFromInitialRepositories(ir *repositories.InitialRepositories) ControllerDeps {
	cfg, _ := configs.Load()
	authSvc := authService.New(ir.User, ir.Auth, cfg.JWTSecret, cfg.AccessTokenTTL, cfg.RefreshTokenTTL, cfg.RateLimitWindow, cfg.RateLimitMaxAttempts)
	userSvc := authService.NewUserService(ir.User)
	bookSvc := bookService.New(ir.Book)
	readSvc := readingService.New(ir.Reading)
	wishSvc := wishlistService.New(ir.Wishlist, ir.PurchaseLink)

	return ControllerDeps{
		Main:     &MainService{books: bookSvc, reading: readSvc, users: userSvc},
		Auth:     &authController.ServiceBridge{Auth: authSvc, User: userSvc},
		Book:     &bookController.ServiceBridge{Book: bookSvc},
		Reading:  &readingController.ServiceBridge{Reading: readSvc},
		User:     &userController.ServiceBridge{User: userSvc},
		Wishlist: &wishlistController.ServiceBridge{Wishlist: wishSvc},
	}
}
