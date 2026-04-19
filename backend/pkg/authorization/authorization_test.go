package authorization

import "testing"

func TestCanManageUser(t *testing.T) {
	if !CanManageUser(RoleAdmin, "a", "b") {
		t.Fatal("admin should manage")
	}
	if !CanManageUser(RoleReader, "a", "a") {
		t.Fatal("owner should manage self")
	}
	if CanManageUser(RoleReader, "a", "b") {
		t.Fatal("reader should not manage others")
	}
}
