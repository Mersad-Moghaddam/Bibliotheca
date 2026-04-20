package validation

import (
	"errors"
	"fmt"
	"net/mail"
	"regexp"
	"strings"
)

const (
	MinPasswordLength = 8
	MaxPasswordLength = 72
)

var hhmmPattern = regexp.MustCompile(`^(?:[01]\d|2[0-3]):[0-5]\d$`)
var mobilePattern = regexp.MustCompile(`^\+[1-9]\d{9,14}$`)

type Errors map[string]string

func (e Errors) Add(field, reason string) {
	if _, exists := e[field]; !exists {
		e[field] = reason
	}
}

func (e Errors) HasAny() bool { return len(e) > 0 }

func Required(value, field string, errs Errors) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		errs.Add(field, "is required")
	}
	return trimmed
}

func StringLength(value, field string, min, max int, errs Errors) {
	l := len(value)
	if l < min || l > max {
		errs.Add(field, fmt.Sprintf("length must be between %d and %d", min, max))
	}
}

func Enum(value, field string, options map[string]struct{}, errs Errors) {
	if _, ok := options[value]; !ok {
		errs.Add(field, "invalid value")
	}
}

func MinInt(value int, field string, min int, errs Errors) {
	if value < min {
		errs.Add(field, fmt.Sprintf("must be >= %d", min))
	}
}

func MinFloat(value float64, field string, min float64, errs Errors) {
	if value < min {
		errs.Add(field, fmt.Sprintf("must be >= %.2f", min))
	}
}

func Email(value, field string, errs Errors) {
	if value == "" {
		return
	}
	if _, err := mail.ParseAddress(value); err != nil {
		errs.Add(field, "is invalid")
	}
}

func Mobile(value, field string, errs Errors) string {
	if value == "" {
		return value
	}
	normalized, err := NormalizeMobile(value)
	if err != nil {
		errs.Add(field, "is invalid")
		return strings.TrimSpace(value)
	}
	return normalized
}

func NormalizeDigits(value string) string {
	var b strings.Builder
	b.Grow(len(value))
	for _, r := range strings.TrimSpace(value) {
		switch {
		case r >= '0' && r <= '9':
			b.WriteRune(r)
		case r >= '۰' && r <= '۹':
			b.WriteRune('0' + (r - '۰'))
		case r >= '٠' && r <= '٩':
			b.WriteRune('0' + (r - '٠'))
		}
	}
	return b.String()
}

func NormalizeMobile(value string) (string, error) {
	if strings.TrimSpace(value) == "" {
		return "", errors.New("mobile is required")
	}
	sanitized := strings.TrimSpace(value)
	sanitized = strings.NewReplacer(" ", "", "-", "", "(", "", ")", "").Replace(sanitized)
	hasPlus := strings.HasPrefix(sanitized, "+")
	digits := NormalizeDigits(sanitized)
	if digits == "" {
		return "", errors.New("mobile is invalid")
	}
	switch {
	case strings.HasPrefix(digits, "0098"):
		digits = "98" + strings.TrimPrefix(digits, "0098")
	case strings.HasPrefix(digits, "09") && len(digits) == 11:
		digits = "98" + digits[1:]
	case strings.HasPrefix(digits, "9") && len(digits) == 10:
		digits = "98" + digits
	}

	normalized := "+" + digits
	if hasPlus && !strings.HasPrefix(normalized, "+") {
		normalized = "+" + digits
	}
	if !mobilePattern.MatchString(normalized) {
		return "", errors.New("mobile is invalid")
	}
	return normalized, nil
}

func TimeHHMM(value, field string, errs Errors) {
	if value == "" {
		return
	}
	if !hhmmPattern.MatchString(value) {
		errs.Add(field, "must use HH:MM format")
	}
}
