package bookSchema

type BookRequest struct {
	Title      string `json:"title"`
	Author     string `json:"author"`
	TotalPages int    `json:"totalPages"`
	Status     string `json:"status"`
}

type BookStatusRequest struct {
	Status string `json:"status"`
}
