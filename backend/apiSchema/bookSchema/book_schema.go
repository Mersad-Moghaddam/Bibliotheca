package bookSchema

type BookRequest struct {
	Title      string  `json:"title"`
	Author     string  `json:"author"`
	TotalPages int     `json:"totalPages"`
	Status     string  `json:"status"`
	CoverURL   *string `json:"coverUrl"`
	Genre      *string `json:"genre"`
	ISBN       *string `json:"isbn"`
}

type BookStatusRequest struct {
	Status           string  `json:"status"`
	FinishRating     *int    `json:"finishRating"`
	FinishReflection *string `json:"finishReflection"`
	FinishHighlight  *string `json:"finishHighlight"`
}

type BookNoteRequest struct {
	Note      string  `json:"note"`
	Highlight *string `json:"highlight"`
}
