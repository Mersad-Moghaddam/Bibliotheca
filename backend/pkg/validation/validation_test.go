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
