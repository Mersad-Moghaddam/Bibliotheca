package reminders

import (
	"fmt"
	"strings"
	"time"

	"negar-backend/pkg/validation"
)

var AllowedFrequencies = map[string]struct{}{
	"daily":    {},
	"weekly":   {},
	"weekdays": {},
	"weekends": {},
}

func IsAllowedFrequency(value string) bool {
	_, ok := AllowedFrequencies[value]
	return ok
}

func normalizeTimezone(timezone string) (string, bool) {
	tz := strings.TrimSpace(timezone)
	if tz == "" {
		return "UTC", true
	}
	if _, err := time.LoadLocation(tz); err != nil {
		return "", false
	}
	return tz, true
}

func NormalizeAndValidateSettings(reminderTime, frequency, timezone string) (string, string, string, bool) {
	normalizedTime := strings.TrimSpace(reminderTime)
	normalizedFrequency := strings.TrimSpace(frequency)
	normalizedTimezone, tzOK := normalizeTimezone(timezone)
	if normalizedTime == "" || !IsAllowedFrequency(normalizedFrequency) || !tzOK {
		return "", "", "", false
	}
	errs := validation.Errors{}
	validation.TimeHHMM(normalizedTime, "time", errs)
	if errs.HasAny() {
		return "", "", "", false
	}
	return normalizedTime, normalizedFrequency, normalizedTimezone, true
}

func NextReminderAt(now time.Time, enabled bool, reminderTime, frequency, timezone string) *string {
	slot, ok := NextReminderTime(now, enabled, reminderTime, frequency, timezone)
	if !ok {
		return nil
	}
	formatted := slot.UTC().Format(time.RFC3339)
	return &formatted
}

func NextReminderTime(now time.Time, enabled bool, reminderTime, frequency, timezone string) (time.Time, bool) {
	if !enabled {
		return time.Time{}, false
	}
	loc, err := time.LoadLocation(strings.TrimSpace(timezone))
	if err != nil {
		loc = time.UTC
	}
	localNow := now.In(loc)
	candidate, err := time.ParseInLocation("15:04", reminderTime, loc)
	if err != nil {
		return time.Time{}, false
	}

	next := time.Date(localNow.Year(), localNow.Month(), localNow.Day(), candidate.Hour(), candidate.Minute(), 0, 0, loc)
	if !isEligibleDay(next, frequency) || !next.After(localNow) {
		next = advanceToNextEligible(next, frequency, localNow)
	}
	return next.UTC(), true
}

func DueSlot(now time.Time, enabled bool, reminderTime, frequency, timezone string, graceWindow time.Duration) (time.Time, bool) {
	if !enabled {
		return time.Time{}, false
	}
	loc, err := time.LoadLocation(strings.TrimSpace(timezone))
	if err != nil {
		loc = time.UTC
	}
	localNow := now.In(loc)
	candidate, err := time.ParseInLocation("15:04", reminderTime, loc)
	if err != nil {
		return time.Time{}, false
	}
	slot := time.Date(localNow.Year(), localNow.Month(), localNow.Day(), candidate.Hour(), candidate.Minute(), 0, 0, loc)
	if !isEligibleDay(slot, frequency) {
		return time.Time{}, false
	}
	if localNow.Before(slot) || localNow.After(slot.Add(graceWindow)) {
		return time.Time{}, false
	}
	return slot.UTC(), true
}

func ReminderIdempotencyKey(userID, channel string, scheduledFor time.Time) string {
	return fmt.Sprintf("%s:%s:%s", userID, channel, scheduledFor.UTC().Format(time.RFC3339))
}

func isEligibleDay(day time.Time, frequency string) bool {
	switch frequency {
	case "", "daily":
		return true
	case "weekly":
		return day.Weekday() == time.Monday
	case "weekdays":
		return day.Weekday() >= time.Monday && day.Weekday() <= time.Friday
	case "weekends":
		return day.Weekday() == time.Saturday || day.Weekday() == time.Sunday
	default:
		return false
	}
}

func advanceToNextEligible(candidate time.Time, frequency string, now time.Time) time.Time {
	next := candidate
	for i := 0; i < 8; i++ {
		if next.After(now) && isEligibleDay(next, frequency) {
			return next
		}
		next = next.Add(24 * time.Hour)
	}
	return candidate.Add(24 * time.Hour)
}
