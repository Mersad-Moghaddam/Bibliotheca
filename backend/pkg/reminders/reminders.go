package reminders

import (
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

func NormalizeAndValidateSettings(reminderTime, frequency string) (string, string, bool) {
	normalizedTime := strings.TrimSpace(reminderTime)
	normalizedFrequency := strings.TrimSpace(frequency)
	if normalizedTime == "" || !IsAllowedFrequency(normalizedFrequency) {
		return "", "", false
	}
	errs := validation.Errors{}
	validation.TimeHHMM(normalizedTime, "time", errs)
	if errs.HasAny() {
		return "", "", false
	}
	return normalizedTime, normalizedFrequency, true
}

func NextReminderAt(now time.Time, enabled bool, reminderTime, frequency string) *string {
	if !enabled {
		return nil
	}

	candidate, err := time.ParseInLocation("15:04", reminderTime, now.Location())
	if err != nil {
		return nil
	}

	next := time.Date(now.Year(), now.Month(), now.Day(), candidate.Hour(), candidate.Minute(), 0, 0, now.Location())
	if !isEligibleDay(next, frequency) || !next.After(now) {
		next = advanceToNextEligible(next, frequency, now)
	}

	formatted := next.Format(time.RFC3339)
	return &formatted
}

func isEligibleDay(day time.Time, frequency string) bool {
	switch frequency {
	case "", "daily", "weekly":
		return true
	case "weekdays":
		return day.Weekday() >= time.Monday && day.Weekday() <= time.Friday
	case "weekends":
		return day.Weekday() == time.Saturday || day.Weekday() == time.Sunday
	default:
		return false
	}
}

func advanceToNextEligible(candidate time.Time, frequency string, now time.Time) time.Time {
	switch frequency {
	case "weekly":
		if candidate.After(now) {
			return candidate
		}
		return candidate.AddDate(0, 0, 7)
	default:
		next := candidate
		for i := 0; i < 7; i++ {
			if next.After(now) && isEligibleDay(next, frequency) {
				return next
			}
			next = next.Add(24 * time.Hour)
		}
		return candidate
	}
}
