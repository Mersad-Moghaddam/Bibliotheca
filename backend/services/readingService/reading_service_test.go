package readingService

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"libro-backend/models/book"
	"libro-backend/models/readingGoal"
	"libro-backend/models/readingSession"
)

type fakeReadingRepo struct {
	goals     []readingGoal.ReadingGoal
	sessions  []readingSession.ReadingSession
	completed int64
}

func (f *fakeReadingRepo) UpdateCurrentPage(_ context.Context, _, _ uuid.UUID, _ int) (*book.Book, error) {
	return nil, nil
}
func (f *fakeReadingRepo) CreateSession(_ context.Context, s *readingSession.ReadingSession) error {
	f.sessions = append(f.sessions, *s)
	return nil
}
func (f *fakeReadingRepo) ListSessions(_ context.Context, _ uuid.UUID, _ int) ([]readingSession.ReadingSession, error) {
	return f.sessions, nil
}
func (f *fakeReadingRepo) UpsertGoal(_ context.Context, g *readingGoal.ReadingGoal) error {
	for i := range f.goals {
		if f.goals[i].Period == g.Period && f.goals[i].StartDate.Equal(*g.StartDate) {
			f.goals[i] = *g
			return nil
		}
	}
	f.goals = append(f.goals, *g)
	return nil
}
func (f *fakeReadingRepo) FindGoalByWindow(_ context.Context, _ uuid.UUID, period string, startDate, _ time.Time) (*readingGoal.ReadingGoal, error) {
	for i := range f.goals {
		if f.goals[i].Period == period && f.goals[i].StartDate != nil && f.goals[i].StartDate.Equal(startDate) {
			return &f.goals[i], nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}
func (f *fakeReadingRepo) ListGoals(_ context.Context, _ uuid.UUID) ([]readingGoal.ReadingGoal, error) {
	return f.goals, nil
}
func (f *fakeReadingRepo) CountCompletedBooksBetween(_ context.Context, _ uuid.UUID, _, _ time.Time) (int64, error) {
	return f.completed, nil
}

func TestSaveGoalsAndGetOverview(t *testing.T) {
	t.Parallel()
	repo := &fakeReadingRepo{}
	svc := New(repo)
	uid := uuid.New()
	pages := 120
	books := 1
	if err := svc.SaveGoals(context.Background(), uid, &GoalUpdateInput{TargetPages: &pages, TargetBooks: &books}, nil, false); err != nil {
		t.Fatalf("save weekly goal failed: %v", err)
	}
	overview, err := svc.GetGoalsOverview(context.Background(), uid)
	if err != nil {
		t.Fatalf("overview failed: %v", err)
	}
	if overview.Weekly.TargetPages == nil || *overview.Weekly.TargetPages != 120 {
		t.Fatal("expected weekly target pages to be saved")
	}
}

func TestGoalStatusExceeded(t *testing.T) {
	t.Parallel()
	repo := &fakeReadingRepo{}
	svc := New(repo)
	uid := uuid.New()
	start, end := weekWindow(time.Now())
	target := 50
	repo.goals = []readingGoal.ReadingGoal{{UserID: uid, Period: "weekly", TargetPages: &target, StartDate: &start, EndDate: &end, Source: "manual"}}
	repo.sessions = []readingSession.ReadingSession{{UserID: uid, BookID: uuid.New(), Date: time.Now(), PagesRead: 90, Duration: 20}}
	overview, err := svc.GetGoalsOverview(context.Background(), uid)
	if err != nil {
		t.Fatalf("overview failed: %v", err)
	}
	if overview.Weekly.Status != "exceeded" {
		t.Fatalf("expected exceeded status, got %s", overview.Weekly.Status)
	}
}

func TestSuggestionsWithSparseData(t *testing.T) {
	t.Parallel()
	repo := &fakeReadingRepo{completed: 0}
	svc := New(repo)
	overview, err := svc.GetGoalsOverview(context.Background(), uuid.New())
	if err != nil {
		t.Fatalf("overview failed: %v", err)
	}
	if len(overview.Suggestions) != 0 {
		t.Fatalf("expected no suggestions for sparse data, got %d", len(overview.Suggestions))
	}
}
