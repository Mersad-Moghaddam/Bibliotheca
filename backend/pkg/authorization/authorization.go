package authorization

const (
	RoleReader = "reader"
	RoleAdmin  = "admin"
)

func CanManageUser(actorRole, actorUserID, targetUserID string) bool {
	return actorRole == RoleAdmin || (actorUserID != "" && actorUserID == targetUserID)
}

func CanAccessAudit(actorRole string) bool {
	return actorRole == RoleAdmin
}
