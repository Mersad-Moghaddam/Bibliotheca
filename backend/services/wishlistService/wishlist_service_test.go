package wishlistService

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"negar-backend/models/purchaseLink"
	"negar-backend/models/wishlist"
	"negar-backend/repositories"
	"negar-backend/statics/customErr"
)

type fakeWishlistRepo struct {
	items map[uuid.UUID]*wishlist.Wishlist
	err   error
}

func (f *fakeWishlistRepo) List(_ context.Context, _ uuid.UUID, _ repositories.WishlistFilter) ([]wishlist.Wishlist, int64, error) {
	return nil, 0, errors.New("not implemented")
}
func (f *fakeWishlistRepo) Create(_ context.Context, _ *wishlist.Wishlist) error {
	return errors.New("not implemented")
}
func (f *fakeWishlistRepo) GetByID(_ context.Context, _ uuid.UUID, _ uuid.UUID) (*wishlist.Wishlist, error) {
	return nil, errors.New("not implemented")
}
func (f *fakeWishlistRepo) Update(_ context.Context, _ *wishlist.Wishlist) error {
	return errors.New("not implemented")
}

func (f *fakeWishlistRepo) Delete(_ context.Context, userID, id uuid.UUID) error {
	if f.err != nil {
		return f.err
	}
	item, ok := f.items[id]
	if !ok {
		return customErr.ErrNotFound
	}
	if item.UserID != userID {
		return customErr.ErrNotFound
	}
	delete(f.items, id)
	return nil
}

type fakePurchaseLinkRepo struct{}

func (f *fakePurchaseLinkRepo) Create(_ context.Context, _ *purchaseLink.PurchaseLink) error {
	return errors.New("not implemented")
}
func (f *fakePurchaseLinkRepo) Update(_ context.Context, _, _, _ uuid.UUID, _, _ string) (*purchaseLink.PurchaseLink, error) {
	return nil, errors.New("not implemented")
}
func (f *fakePurchaseLinkRepo) Delete(_ context.Context, _, _, _ uuid.UUID) error {
	return errors.New("not implemented")
}

func TestDeleteWishlistItemSuccess(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	itemID := uuid.New()
	repo := &fakeWishlistRepo{
		items: map[uuid.UUID]*wishlist.Wishlist{
			itemID: {ID: itemID, UserID: userID, Title: "Deep Work", Author: "Cal Newport"},
		},
	}
	svc := New(repo, &fakePurchaseLinkRepo{})

	if err := svc.Delete(context.Background(), userID, itemID); err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if _, exists := repo.items[itemID]; exists {
		t.Fatal("expected wishlist item to be removed")
	}
}

func TestDeleteWishlistItemByAnotherUser(t *testing.T) {
	t.Parallel()

	ownerID := uuid.New()
	otherUserID := uuid.New()
	itemID := uuid.New()
	repo := &fakeWishlistRepo{
		items: map[uuid.UUID]*wishlist.Wishlist{
			itemID: {ID: itemID, UserID: ownerID, Title: "Refactoring", Author: "Martin Fowler"},
		},
	}
	svc := New(repo, &fakePurchaseLinkRepo{})

	err := svc.Delete(context.Background(), otherUserID, itemID)
	if !errors.Is(err, customErr.ErrNotFound) {
		t.Fatalf("expected not found error, got %v", err)
	}
}

func TestDeleteWishlistItemNotFound(t *testing.T) {
	t.Parallel()

	svc := New(&fakeWishlistRepo{items: map[uuid.UUID]*wishlist.Wishlist{}}, &fakePurchaseLinkRepo{})
	err := svc.Delete(context.Background(), uuid.New(), uuid.New())
	if !errors.Is(err, customErr.ErrNotFound) {
		t.Fatalf("expected not found error, got %v", err)
	}
}
