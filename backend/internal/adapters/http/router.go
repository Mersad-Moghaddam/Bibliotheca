package http

import (
	"bibliotheca/backend/internal/adapters/http/handlers"
	"bibliotheca/backend/internal/adapters/http/middleware"
	"github.com/gofiber/fiber/v2"
)

type RouteDeps struct {
	JWTSecret string
	Auth      *handlers.AuthHandler
	Books     *handlers.BookHandler
	Wishlist  *handlers.WishlistHandler
	Dashboard *handlers.DashboardHandler
	User      *handlers.UserHandler
}

func RegisterRoutes(app *fiber.App, d RouteDeps) {
	api := app.Group("/api/v1")
	auth := api.Group("/auth")
	auth.Post("/register", d.Auth.Register)
	auth.Post("/login", d.Auth.Login)
	auth.Post("/refresh", d.Auth.Refresh)
	auth.Post("/logout", d.Auth.Logout)

	protected := api.Group("", middleware.AuthMiddleware(d.JWTSecret))
	protected.Get("/auth/me", d.Auth.Me)

	protected.Get("/books", d.Books.List)
	protected.Post("/books", d.Books.Create)
	protected.Get("/books/:id", d.Books.Get)
	protected.Put("/books/:id", d.Books.Update)
	protected.Delete("/books/:id", d.Books.Delete)
	protected.Patch("/books/:id/status", d.Books.UpdateStatus)
	protected.Patch("/books/:id/bookmark", d.Books.UpdateBookmark)

	protected.Get("/wishlist", d.Wishlist.List)
	protected.Post("/wishlist", d.Wishlist.Create)
	protected.Get("/wishlist/:id", d.Wishlist.Get)
	protected.Put("/wishlist/:id", d.Wishlist.Update)
	protected.Delete("/wishlist/:id", d.Wishlist.Delete)
	protected.Post("/wishlist/:id/links", d.Wishlist.AddLink)
	protected.Put("/wishlist/:id/links/:linkId", d.Wishlist.UpdateLink)
	protected.Delete("/wishlist/:id/links/:linkId", d.Wishlist.DeleteLink)

	protected.Get("/dashboard/summary", d.Dashboard.Summary)
	protected.Put("/users/profile", d.User.UpdateProfile)
	protected.Put("/users/password", d.User.UpdatePassword)
}
