package validation

import (
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

func TimeHHMM(value, field string, errs Errors) {
	if value == "" {
		return
	}
	if !hhmmPattern.MatchString(value) {
		errs.Add(field, "must use HH:MM format")
	}
}
