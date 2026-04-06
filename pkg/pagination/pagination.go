package pagination

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"libro/models/commonPagination"
)

func Parse(c *fiber.Ctx) commonPagination.PageRequest {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	return commonPagination.PageRequest{Page: page, Limit: limit, Search: strings.TrimSpace(c.Query("search")), Status: strings.TrimSpace(c.Query("status"))}
}

func Offset(req commonPagination.PageRequest) int {
	return (req.Page - 1) * req.Limit
}
