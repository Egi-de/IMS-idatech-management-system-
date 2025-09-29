# Dynamic Header Menu Task

## Steps to Complete

### 1. Backend Updates (Completed)
- [x] Edit server/settings/views.py: Add UserProfileView to return user data (name, email, role, avatar).
- [x] Edit server/settings/urls.py: Add URL path for /api/settings/user/.

### 2. Frontend API Integration (Header)
- [x] Edit client/src/services/api.js: Add getUserProfile function to fetch user data.
- [x] Edit client/src/components/Header.jsx: 
  - Replace hardcoded user state with dynamic fetch using getUserProfile.
  - Add useEffect to load user on component mount if authenticated (token in localStorage).
  - Handle loading state and errors (e.g., 401: clear token, redirect to login).
  - Update profile dropdown to display dynamic user data (user?.name, etc.).
  - Ensure theme toggle and other features remain intact.

### 2.5. Profile Page Dynamic Integration
- [x] Edit client/src/pages/Profile.jsx:
  - Add fetch for user profile on mount using getUserProfile.
  - Merge backend data (name, email, role, avatar, phone, department, joinDate) with defaults.
  - Add loading spinner while fetching; redirect to login on no token or auth error.
  - Update display and editable fields to use dynamic data (user?.field || default).
  - Backend persistence: On save, PATCH to /api/settings/user/ updates User (name/email) and UserSettings JSON (phone/dept/avatar); success toast, error handling.

### 3. Testing and Verification
- [x] Start backend: `cd server; python manage.py runserver` (use `;` for PowerShell if needed).
- [x] Ensure frontend running: `cd client; npm run dev`.
- [x] Login with 'admin'/'admin123' at http://localhost:5174/login (note: port may vary).
- [x] Header: On /dashboard, verify profile dropdown shows backend data (name: 'admin', email: 'admin@example.com', role: 'Administrator').
- [x] Profile: Navigate to /profile; verify loads dynamic data (e.g., name/email from backend, defaults for phone/dept, joinDate from user.date_joined); edit phone/dept/name/email, save persists (refresh page to confirm no loss); cancel resets to original.
- [x] Menu items: Profile/Settings links work; logout clears token and redirects to /login.
- [x] Edge cases: No token (redirect to login); invalid token (fetch error -> clear token, redirect with toast); network error (similar handling); save error (toast, no update).
- [x] Update this TODO.md with [x] for completed steps.

### 4. Optional Enhancements (If Needed Later)
- [ ] Add custom UserProfile model for role/avatar if hardcoded insufficient.
- [ ] Integrate real notifications fetch similar to user data.
