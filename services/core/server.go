package core

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"libro-backend/controllers/authController"
	"libro-backend/controllers/bookController"
	"libro-backend/controllers/mainController"
	"libro-backend/controllers/readingController"
	"libro-backend/controllers/userController"
	"libro-backend/controllers/wishlistController"
	"libro-backend/middleware/auth"
	"libro-backend/statics/configs"
)

func NewServer(cfg *configs.Config, deps mainController.ControllerDeps) *fiber.App {
	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{AllowOrigins: cfg.FrontendURL, AllowHeaders: "Origin, Content-Type, Accept, Authorization"}))

	mainCtrl := mainController.NewMainController(deps.Main)
	authCtrl := authController.NewAuthController(deps.Auth)
	bookCtrl := bookController.NewBookController(deps.Book)
	readCtrl := readingController.NewReadingController(deps.Reading)
	wishCtrl := wishlistController.NewWishlistController(deps.Wishlist)
	userCtrl := userController.NewUserController(deps.User)

	app.Get("/health", mainCtrl.Health)

	api := app.Group("/api/v1")
	authRoutes := api.Group("/auth")
	authRoutes.Post("/register", authCtrl.Register)
	authRoutes.Post("/login", authCtrl.Login)
	authRoutes.Post("/refresh", authCtrl.Refresh)
	authRoutes.Post("/logout", authCtrl.Logout)

	protected := api.Group("", auth.AuthMiddleware(cfg.JWTSecret))
	protected.Get("/auth/me", authCtrl.Me)
	protected.Get("/dashboard/summary", mainCtrl.DashboardSummary)
	protected.Get("/books", bookCtrl.List)
	protected.Post("/books", bookCtrl.Create)
	protected.Get("/books/:id", bookCtrl.Get)
	protected.Put("/books/:id", bookCtrl.Update)
	protected.Delete("/books/:id", bookCtrl.Delete)
	protected.Patch("/books/:id/status", bookCtrl.UpdateStatus)
	protected.Patch("/books/:id/progress", readCtrl.UpdateProgress)
	protected.Get("/wishlist", wishCtrl.List)
	protected.Post("/wishlist", wishCtrl.Create)
	protected.Get("/wishlist/:id", wishCtrl.Get)
	protected.Put("/wishlist/:id", wishCtrl.Update)
	protected.Delete("/wishlist/:id", wishCtrl.Delete)
	protected.Post("/wishlist/:id/links", wishCtrl.AddLink)
	protected.Put("/wishlist/:id/links/:linkId", wishCtrl.UpdateLink)
	protected.Delete("/wishlist/:id/links/:linkId", wishCtrl.DeleteLink)
	protected.Put("/users/profile", userCtrl.UpdateProfile)
	protected.Put("/users/password", userCtrl.UpdatePassword)

	return app
}
