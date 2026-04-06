package controllers

import "github.com/google/uuid"

func ParseUUID(id string) uuid.UUID {
	u, _ := uuid.Parse(id)
	return u
}
