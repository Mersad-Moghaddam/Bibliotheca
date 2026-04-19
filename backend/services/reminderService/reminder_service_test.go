package reminderService

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"negar-backend/models/reminderDelivery"
	"negar-backend/models/user"
)

type userRepoStub struct{ users []user.User }

func (s userRepoStub) Create(context.Context, *user.User) error                 { return nil }
func (s userRepoStub) GetByEmail(context.Context, string) (*user.User, error)   { return nil, nil }
func (s userRepoStub) GetByID(context.Context, uuid.UUID) (*user.User, error)   { return nil, nil }
func (s userRepoStub) Update(context.Context, *user.User) error                 { return nil }
func (s userRepoStub) ListReminderEnabled(context.Context) ([]user.User, error) { return s.users, nil }

type deliveryRepoStub struct {
	created int
	rows    []reminderDelivery.ReminderDelivery
}

func (d *deliveryRepoStub) CreatePending(_ context.Context, _ *reminderDelivery.ReminderDelivery) (bool, error) {
	d.created++
	return true, nil
}
func (d *deliveryRepoStub) ListDispatchable(context.Context, time.Time, int) ([]reminderDelivery.ReminderDelivery, error) {
	return d.rows, nil
}
func (d *deliveryRepoStub) MarkProcessing(context.Context, uuid.UUID) error      { return nil }
func (d *deliveryRepoStub) MarkSent(context.Context, uuid.UUID, time.Time) error { return nil }
func (d *deliveryRepoStub) MarkFailed(context.Context, uuid.UUID, time.Time, string) error {
	return nil
}

type senderStub struct{ fail bool }

func (s senderStub) SendReminder(context.Context, string, time.Time, map[string]any) error {
	if s.fail {
		return errors.New("x")
	}
	return nil
}

func TestTickSchedulesDueReminder(t *testing.T) {
	now := time.Date(2026, 4, 20, 12, 2, 0, 0, time.UTC) // monday
	u := user.User{ID: uuid.New(), ReminderEnabled: true, ReminderTime: "12:00", ReminderFrequency: "daily", ReminderTimezone: "UTC"}
	d := &deliveryRepoStub{}
	svc := New(userRepoStub{users: []user.User{u}}, d, senderStub{}, zap.NewNop())
	svc.Tick(context.Background(), now)
	if d.created == 0 {
		t.Fatal("expected delivery creation")
	}
}
