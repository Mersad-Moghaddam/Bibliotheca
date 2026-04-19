package reminders

import "testing"

func TestNormalizeAndValidateSettings(t *testing.T) {
	tests := []struct {
		name      string
		time      string
		frequency string
		ok        bool
	}{
		{name: "valid normalized", time: " 08:30 ", frequency: " daily ", ok: true},
		{name: "invalid time hour", time: "24:00", frequency: "daily", ok: false},
		{name: "invalid frequency", time: "08:30", frequency: "monthly", ok: false},
		{name: "empty time", time: " ", frequency: "daily", ok: false},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			normalizedTime, normalizedFrequency, ok := NormalizeAndValidateSettings(tc.time, tc.frequency)
			if ok != tc.ok {
				t.Fatalf("expected ok=%v, got %v", tc.ok, ok)
			}
			if ok {
				if normalizedTime != "08:30" && tc.name == "valid normalized" {
					t.Fatalf("expected normalized time 08:30, got %q", normalizedTime)
				}
				if normalizedFrequency != "daily" && tc.name == "valid normalized" {
					t.Fatalf("expected normalized frequency daily, got %q", normalizedFrequency)
				}
			}
		})
	}
}
