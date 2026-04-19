package wishlistController

import (
	"context"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"negar-backend/middleware/auth"
	"negar-backend/models/purchaseLink"
	"negar-backend/models/wishlist"
	"negar-backend/repositories"
	"negar-backend/services/wishlistService"
	"negar-backend/statics/customErr"
)

type controllerTestWishlistRepo struct {
	deleteErr error
}

func (r *controllerTestWishlistRepo) List(_ context.Context, _ uuid.UUID, _ repositories.WishlistFilter) ([]wishlist.Wishlist, int64, error) {
	return nil, 0, nil
}
func (r *controllerTestWishlistRepo) Create(_ context.Context, _ *wishlist.Wishlist) error {
	return nil
}
func (r *controllerTestWishlistRepo) GetByID(_ context.Context, _, _ uuid.UUID) (*wishlist.Wishlist, error) {
	return nil, customErr.ErrNotFound
}
func (r *controllerTestWishlistRepo) Update(_ context.Context, _ *wishlist.Wishlist) error {
	return nil
}
func (r *controllerTestWishlistRepo) Delete(_ context.Context, _, _ uuid.UUID) error {
	return r.deleteErr
}

type controllerTestLinkRepo struct{}

func (r *controllerTestLinkRepo) Create(_ context.Context, _ *purchaseLink.PurchaseLink) error {
	return nil
}
func (r *controllerTestLinkRepo) Update(_ context.Context, _, _, _ uuid.UUID, _, _ string) (*purchaseLink.PurchaseLink, error) {
	return nil, nil
}
func (r *controllerTestLinkRepo) Delete(_ context.Context, _, _, _ uuid.UUID) error { return nil }

func newControllerForTest(deleteErr error) *WishlistController {
	service := wishlistService.New(&controllerTestWishlistRepo{deleteErr: deleteErr}, &controllerTestLinkRepo{})
	return NewWishlistController(&ServiceBridge{Wishlist: service})
}

func TestWishlistDeleteUnauthorized(t *testing.T) {
	t.Parallel()

	app := fiber.New()
	ctrl := newControllerForTest(nil)
	app.Delete("/wishlist/:id", auth.AuthMiddleware("test-secret", zap.NewNop()), ctrl.Delete)

	req := httptest.NewRequest("DELETE", "/wishlist/"+uuid.NewString(), nil)
	res, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if res.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", res.StatusCode)
	}
}

func TestWishlistDeleteInvalidID(t *testing.T) {
	t.Parallel()

	app := fiber.New()
	ctrl := newControllerForTest(nil)
	app.Delete("/wishlist/:id", func(c *fiber.Ctx) error {
		c.Locals("userID", uuid.NewString())
		return ctrl.Delete(c)
	})

	req := httptest.NewRequest("DELETE", "/wishlist/not-a-uuid", nil)
	res, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if res.StatusCode != fiber.StatusBadRequest {
		t.Fatalf("expected 400, got %d", res.StatusCode)
	}
}

func TestWishlistDeleteNotFound(t *testing.T) {
	t.Parallel()

	app := fiber.New()
	ctrl := newControllerForTest(customErr.ErrNotFound)
	app.Delete("/wishlist/:id", func(c *fiber.Ctx) error {
		c.Locals("userID", uuid.NewString())
		return ctrl.Delete(c)
	})

	req := httptest.NewRequest("DELETE", "/wishlist/"+uuid.NewString(), nil)
	res, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if res.StatusCode != fiber.StatusNotFound {
		t.Fatalf("expected 404, got %d", res.StatusCode)
	}
}
