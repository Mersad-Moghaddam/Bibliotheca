package reminders

import (
	"testing"
	"time"
)

func TestNextReminderAtDisabled(t *testing.T) {
	now := time.Date(2026, 4, 19, 10, 0, 0, 0, time.UTC)
	if got := NextReminderAt(now, false, "09:00", "daily", "UTC"); got != nil {
		t.Fatalf("expected nil reminder when disabled, got %v", *got)
	}
}

func TestNextReminderAtWeekdaysSkipsWeekend(t *testing.T) {
	now := time.Date(2026, 4, 19, 10, 0, 0, 0, time.UTC) // Sunday
	got := NextReminderAt(now, true, "09:00", "weekdays", "UTC")
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

func TestDueSlotTimezone(t *testing.T) {
	now := time.Date(2026, 4, 19, 16, 1, 0, 0, time.UTC)
	slot, ok := DueSlot(now, true, "12:00", "daily", "America/New_York", 5*time.Minute)
	if !ok {
		t.Fatal("expected due slot")
	}
	if slot.UTC().Hour() != 16 {
		t.Fatalf("expected UTC hour 16, got %d", slot.UTC().Hour())
	}
}
