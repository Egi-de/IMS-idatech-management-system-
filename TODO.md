# Employee Issues Fix TODO

## Backend Changes

- [ ] Add `idNumber` field to Employee model in `server/Employee/models.py`
- [ ] Run Django migrations to add the new field
- [ ] Update EmployeeSerializer to include `idNumber` in fields

## Frontend Changes

- [ ] Update Employees.jsx table to display `idNumber` in ID column instead of `employeeId`
- [ ] Update avatar image src to use actual avatar URL from API response
- [ ] Add confirmation dialog for delete action to prevent accidental deletions

## Testing

- [ ] Test adding new employee with idNumber and verify it displays in table
- [ ] Test avatar upload and display in table and modal
- [ ] Test delete functionality with confirmation dialog
