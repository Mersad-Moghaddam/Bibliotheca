# Compatibility Notes (Legacy Libro -> Negar)

Negar intentionally keeps backward compatibility for persisted browser keys so existing users are not logged out or reset after rename.

## Preserved legacy keys
- Auth store: `libro.auth` is migrated to `negar.auth`.
- Locale: `libro.locale` is read as fallback for `negar.locale`.
- Theme: `libro-theme` is read as fallback for `negar-theme`.

## Policy
- New writes use `negar.*` keys.
- Legacy keys remain read-compatible for migration safety.
- Docs and runtime defaults should use `Negar` naming for all new references.
