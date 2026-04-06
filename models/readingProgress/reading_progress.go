package readingProgress

type ReadingProgress struct {
	CurrentPage        int `json:"currentPage"`
	RemainingPages     int `json:"remainingPages"`
	ProgressPercentage int `json:"progressPercentage"`
}
