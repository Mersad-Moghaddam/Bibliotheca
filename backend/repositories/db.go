package repositories

import (
	"fmt"
	"strings"

	"gorm.io/gorm"
	"negar-backend/models/auditEvent"
	"negar-backend/models/book"
	"negar-backend/models/bookNote"
	"negar-backend/models/purchaseLink"
	"negar-backend/models/readingEvent"
	"negar-backend/models/readingGoal"
	"negar-backend/models/readingSession"
	"negar-backend/models/reminderDelivery"
	"negar-backend/models/user"
	"negar-backend/models/wishlist"
)

const migrationHint = "run SQL migrations from backend/migrations (including 000006_reading_deep_features.up.sql + later migrations)"

func AssertSchema(db *gorm.DB) error {
	checks := []struct {
		model   any
		columns []string
	}{
		{&user.User{}, []string{"id", "name", "mobile_number", "email", "password_hash", "role", "reminder_enabled", "reminder_time", "reminder_frequency", "reminder_timezone", "created_at", "updated_at"}},
		{&book.Book{}, []string{"id", "user_id", "title", "author", "total_pages", "status", "current_page", "cover_url", "genre", "isbn", "completed_at", "finish_rating", "finish_reflection", "finish_highlight", "created_at", "updated_at"}},
		{&wishlist.Wishlist{}, []string{"id", "user_id", "title", "author", "expected_price", "notes", "created_at", "updated_at"}},
		{&purchaseLink.PurchaseLink{}, []string{"id", "wishlist_id", "label", "alias", "url", "created_at", "updated_at"}},
		{&readingSession.ReadingSession{}, []string{"id", "user_id", "book_id", "date", "duration", "pages_read", "created_at", "updated_at"}},
		{&readingGoal.ReadingGoal{}, []string{"id", "user_id", "period", "pages_goal", "books_goal", "source", "start_date", "end_date", "created_at", "updated_at"}},
		{&readingEvent.ReadingEvent{}, []string{"id", "user_id", "book_id", "event_date", "event_type", "pages_delta", "completed_delta", "created_at"}},
		{&bookNote.BookNote{}, []string{"id", "user_id", "book_id", "note", "highlight", "created_at", "updated_at"}},
		{&auditEvent.AuditEvent{}, []string{"id", "actor_user_id", "actor_role", "action", "resource_type", "resource_id", "metadata", "ip_address", "user_agent", "created_at"}},
		{&reminderDelivery.ReminderDelivery{}, []string{"id", "user_id", "channel", "scheduled_for", "status", "attempts", "last_error", "next_attempt_at", "sent_at", "idempotency_key", "payload", "created_at", "updated_at"}},
	}

	for _, check := range checks {
		if !db.Migrator().HasTable(check.model) {
			return fmt.Errorf("missing table for model %T: %s", check.model, migrationHint)
		}
		missingColumns := make([]string, 0)
		for _, column := range check.columns {
			if !db.Migrator().HasColumn(check.model, column) {
				missingColumns = append(missingColumns, column)
			}
		}
		if len(missingColumns) > 0 {
			return fmt.Errorf("missing column(s) [%s] for model %T: %s", strings.Join(missingColumns, ", "), check.model, migrationHint)
		}
	}
	return nil
}
