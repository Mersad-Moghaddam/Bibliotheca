package reminders

import (
	"testing"
	"time"
)

func TestNextReminderAtDisabled(t *testing.T) {
	now := time.Date(2026, 4, 19, 10, 0, 0, 0, time.UTC)
	if got := NextReminderAt(now, false, "09:00", "daily"); got != nil {
		t.Fatalf("expected nil reminder when disabled, got %v", *got)
	}
}

func TestNextReminderAtWeekdaysSkipsWeekend(t *testing.T) {
	now := time.Date(2026, 4, 19, 10, 0, 0, 0, time.UTC) // Sunday
	got := NextReminderAt(now, true, "09:00", "weekdays")
	if got == nil {
		t.Fatal("expected reminder for next weekday")
	}
	parsed, err := time.Parse(time.RFC3339, *got)
	if err != nil {
		t.Fatalf("parse reminder time: %v", err)
	}
	if parsed.Weekday() != time.Monday {
		t.Fatalf("expected Monday reminder, got %s", parsed.Weekday())
	}
}
