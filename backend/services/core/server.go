package core

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"go.uber.org/zap"
	"libro-backend/controllers/authController"
	"libro-backend/controllers/bookController"
	"libro-backend/controllers/mainController"
	"libro-backend/controllers/readingController"
	"libro-backend/controllers/userController"
	"libro-backend/controllers/wishlistController"
	"libro-backend/middleware/auth"
	"libro-backend/middleware/requestctx"
	"libro-backend/statics/configs"
)

func NewServer(cfg *configs.Config, deps mainController.ControllerDeps, logger *zap.Logger) *fiber.App {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			status := fiber.StatusInternalServerError
			message := "unexpected server error"
			if fiberErr, ok := err.(*fiber.Error); ok {
				status = fiberErr.Code
				message = fiberErr.Message
			}

			requestctx.LoggerFromCtx(c, logger).Error("request_unhandled_error",
				zap.Int("status_code", status),
				zap.Error(err),
			)

			return c.Status(status).JSON(fiber.Map{
				"code":    "request_failed",
				"message": message,
				"details": fmt.Sprintf("request_id=%s", c.GetRespHeader(requestctx.RequestIDHeader)),
			})
		},
	})
	app.Use(requestid.New(requestid.Config{Header: requestctx.RequestIDHeader}))
	app.Use(requestctx.RequestLogger(logger))
	app.Use(recover.New(recover.Config{
		EnableStackTrace: true,
		StackTraceHandler: func(c *fiber.Ctx, e interface{}) {
			requestctx.LoggerFromCtx(c, logger).Error("panic_recovered", zap.Any("panic", e))
		},
	}))
	app.Use(cors.New(cors.Config{AllowOrigins: cfg.FrontendURL, AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Request-ID"}))

	mainCtrl := mainController.NewMainController(deps.Main)
	authCtrl := authController.NewAuthController(deps.Auth)
	bookCtrl := bookController.NewBookController(deps.Book)
	readCtrl := readingController.NewReadingController(deps.Reading)
	wishCtrl := wishlistController.NewWishlistController(deps.Wishlist)
	userCtrl := userController.NewUserController(deps.User)

	app.Get("/health", mainCtrl.Health)
	app.Get("/ready", mainCtrl.Ready)

	api := app.Group("/api/v1")
	authRoutes := api.Group("/auth")
	authRoutes.Post("/register", authCtrl.Register)
	authRoutes.Post("/login", authCtrl.Login)
	authRoutes.Post("/refresh", authCtrl.Refresh)
	authRoutes.Post("/logout", authCtrl.Logout)

	protected := api.Group("", auth.AuthMiddleware(cfg.JWTSecret, logger))
	protected.Get("/auth/me", authCtrl.Me)
	protected.Get("/dashboard/summary", mainCtrl.DashboardSummary)
	protected.Get("/dashboard/analytics", mainCtrl.DashboardAnalytics)
	protected.Get("/dashboard/insights", mainCtrl.DashboardInsights)
	protected.Get("/books", bookCtrl.List)
	protected.Post("/books", bookCtrl.Create)
	protected.Get("/books/:id", bookCtrl.Get)
	protected.Put("/books/:id", bookCtrl.Update)
	protected.Delete("/books/:id", bookCtrl.Delete)
	protected.Patch("/books/:id/status", bookCtrl.UpdateStatus)
	protected.Patch("/books/:id/progress", readCtrl.UpdateProgress)
	protected.Get("/books/:id/notes", bookCtrl.ListNotes)
	protected.Post("/books/:id/notes", bookCtrl.AddNote)
	protected.Delete("/books/:id/notes/:noteId", bookCtrl.DeleteNote)
	protected.Get("/reading/sessions", readCtrl.ListSessions)
	protected.Post("/reading/sessions", readCtrl.AddSession)
	protected.Get("/reading/goals", readCtrl.Goals)
	protected.Put("/reading/goals", readCtrl.UpsertGoal)
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
	protected.Get("/users/reminders", userCtrl.GetReminderSettings)
	protected.Put("/users/reminders", userCtrl.UpdateReminderSettings)

	return app
}
