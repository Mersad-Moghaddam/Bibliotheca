package validation

import "testing"

func TestTimeHHMM(t *testing.T) {
	tests := []struct {
		name    string
		value   string
		isValid bool
	}{
		{name: "valid midnight", value: "00:00", isValid: true},
		{name: "valid end of day", value: "23:59", isValid: true},
		{name: "invalid hour", value: "24:00", isValid: false},
		{name: "invalid minute", value: "12:60", isValid: false},
		{name: "invalid format", value: "9:30", isValid: false},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			errs := Errors{}
			TimeHHMM(tc.value, "time", errs)
			if tc.isValid && errs.HasAny() {
				t.Fatalf("expected valid HH:MM but got errors: %+v", errs)
			}
			if !tc.isValid && !errs.HasAny() {
				t.Fatalf("expected invalid HH:MM for %q", tc.value)
			}
		})
	}
}

func TestNormalizeMobile(t *testing.T) {
	tests := []struct {
		name     string
		value    string
		expected string
		valid    bool
	}{
		{name: "iran local mobile", value: "09123456789", expected: "+989123456789", valid: true},
		{name: "iran intl digits", value: "989123456789", expected: "+989123456789", valid: true},
		{name: "iran plus mobile", value: "+989123456789", expected: "+989123456789", valid: true},
		{name: "persian digits", value: "۰۹۱۲۳۴۵۶۷۸۹", expected: "+989123456789", valid: true},
		{name: "generic e164", value: "+447700900123", expected: "+447700900123", valid: true},
		{name: "invalid short", value: "12345", valid: false},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, err := NormalizeMobile(tc.value)
			if tc.valid && err != nil {
				t.Fatalf("expected valid mobile, got error: %v", err)
			}
			if !tc.valid && err == nil {
				t.Fatalf("expected invalid mobile for %q", tc.value)
			}
			if tc.valid && got != tc.expected {
				t.Fatalf("expected %s, got %s", tc.expected, got)
			}
		})
	}
}
