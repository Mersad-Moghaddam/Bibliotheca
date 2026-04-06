package commonPagination

type PageRequest struct {
	Page   int
	Limit  int
	Search string
	Status string
}

type PageResult struct {
	Page   int   `json:"page"`
	Limit  int   `json:"limit"`
	Total  int64 `json:"total"`
	Offset int   `json:"offset"`
}
