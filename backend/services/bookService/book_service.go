package bookService

import (
	"negar-backend/repositories"
)

type Service struct{ repo repositories.BookRepository }

func New(repo repositories.BookRepository) *Service { return &Service{repo: repo} }
