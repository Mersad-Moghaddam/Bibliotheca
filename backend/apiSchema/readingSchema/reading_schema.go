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

type GoalRequest struct {
	Period    string `json:"period"`
	PagesGoal int    `json:"pages"`
	BooksGoal int    `json:"books"`
}
