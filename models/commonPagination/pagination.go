package commonPagination

type Query struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
}
