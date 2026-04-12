package tests

import (
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"testing"
)

func TestSeedReminderTimeFitsSchema(t *testing.T) {
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("failed to resolve current file path")
	}

	seedPath := filepath.Join(filepath.Dir(currentFile), "..", "seeds", "seed.sql")
	content, err := os.ReadFile(seedPath)
	if err != nil {
		t.Fatalf("read seed file: %v", err)
	}

	invalidTimePattern := regexp.MustCompile(`'\d{2}:\d{2}:\d{2}'`)
	if invalidTimePattern.Match(content) {
		t.Fatalf("seed.sql contains HH:MM:SS reminder_time values, but schema supports VARCHAR(5) HH:MM")
	}
}
