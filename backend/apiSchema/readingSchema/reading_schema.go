package readingSchema

type ProgressRequest struct {
	CurrentPage int `json:"currentPage"`
}

type SessionRequest struct {
	BookID    string `json:"bookId"`
	Date      string `json:"date"`
	Duration  int    `json:"duration"`
	PagesRead int    `json:"pages"`
}

type GoalTargetRequest struct {
	Pages *int `json:"pages"`
	Books *int `json:"books"`
}

type GoalUpdateRequest struct {
	Weekly          *GoalTargetRequest `json:"weekly"`
	Monthly         *GoalTargetRequest `json:"monthly"`
	ApplySuggestion bool               `json:"applySuggestion"`
}
