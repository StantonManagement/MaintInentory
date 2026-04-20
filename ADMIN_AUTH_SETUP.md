# Admin Authentication Setup Guide

## Overview

The Truck Tablet Inventory System now includes secure admin authentication to protect the management interface (`/inventory/*` routes). This guide explains how to set up and use the admin authentication system.

---

## 🔐 Security Features

- **PIN-based authentication** - 4-digit PIN entry (same UX as tablet login)
- **SHA-256 hashing** - PINs are hashed before storage and verification
- **Session management** - 24-hour session timeout with localStorage
- **Protected routes** - All management pages require authentication
- **Sign out functionality** - Clean session termination

---

## 🚀 Quick Start

### Option 1: Use Existing Technician PINs (Recommended)

Any technician with an existing PIN can access the admin interface. No additional setup required!

**To login as admin:**
1. Navigate to `/admin-login` or click "Admin Access" on the home page
2. Enter any valid technician PIN (e.g., 1234 for Stan)
3. You'll be redirected to the management dashboard

### Option 2: Create Dedicated Admin PINs (Future Enhancement)

You can optionally add an `is_admin` column to the `inv_technician_pins` table to restrict admin access to specific users.

---

## 📋 How It Works

### Authentication Flow

```
1. User navigates to /inventory/* route
   ↓
2. ProtectedRoute component checks if user is authenticated
   ↓
3. If NOT authenticated → Redirect to /admin-login
   ↓
4. User enters 4-digit PIN
   ↓
5. PIN is hashed with SHA-256
   ↓
6. Hash is compared with inv_technician_pins table
   ↓
7. If match found → Session stored in localStorage
   ↓
8. User redirected to /inventory/dashboard
   ↓
9. Session valid for 24 hours
```

### Session Storage

Admin sessions are stored in localStorage with the following structure:

```json
{
  "adminId": "uuid",
  "adminName": "Stan",
  "loginTime": "2026-04-14T10:30:00.000Z"
}
```

**Session expires after 24 hours** and user must re-login.

---

## 🛠️ Technical Implementation

### Files Created

1. **`src/services/adminAuth.ts`** - Admin authentication service
   - `authenticateAdmin(pin)` - Verify admin PIN
   - `isAdminAuthenticated()` - Check if admin is logged in
   - `getAdminSession()` - Get current admin info
   - `signOutAdmin()` - Clear admin session

2. **`src/pages/AdminLogin.tsx`** - Admin login page
   - 4-digit PIN entry UI
   - SHA-256 hashing
   - Error handling
   - "Back to Tablet" navigation

3. **`src/components/ProtectedRoute.tsx`** - Route protection
   - Checks authentication status
   - Redirects to login if not authenticated
   - Wraps all `/inventory/*` routes

### Files Modified

1. **`src/App.tsx`**
   - Added `/admin-login` route
   - Wrapped management routes with `ProtectedRoute`
   - Added redirect from `/inventory` → `/inventory/dashboard`

2. **`src/components/management/Sidebar.tsx`**
   - Added admin name display
   - Added "Sign Out" button
   - Integrated session management

3. **`src/pages/Home.tsx`**
   - Added "Admin Access" link in footer

---

## 🔑 Default Admin PINs

Based on your existing seed data, these PINs will work for admin login:

| Technician | PIN  | Access Level |
|------------|------|--------------|
| Stan       | 1234 | Admin        |
| Javier     | 5678 | Admin        |
| Maria      | 9999 | Admin        |

**Note:** Any technician in the `inv_technician_pins` table can currently access the admin interface.

---

## 🎯 Access Points

### For Users:

1. **From Home Page:**
   - Click "Admin Access" link at bottom of page
   - Enter PIN
   - Access management dashboard

2. **Direct URL:**
   - Navigate to `https://inventory.stantoncap.com/admin-login`
   - Enter PIN
   - Access management dashboard

3. **From Any Protected Route:**
   - Try to access `/inventory/dashboard` without being logged in
   - Automatically redirected to `/admin-login`
   - After login, redirected back to dashboard

### For Developers:

**Local Development:**
```bash
npm run dev
# Navigate to http://localhost:5173/admin-login
# Enter PIN: 1234
```

**Production:**
```bash
# Navigate to https://inventory.stantoncap.com/admin-login
# Enter PIN: 1234
```

---

## 🔒 Security Considerations

### Current Implementation (Good):
✅ PIN hashing with SHA-256
✅ Session timeout (24 hours)
✅ Protected routes
✅ Clean sign out
✅ No plaintext PINs in code

### Future Enhancements (Recommended):

1. **Add `is_admin` Column** (Optional)
   ```sql
   ALTER TABLE inv_technician_pins
   ADD COLUMN is_admin BOOLEAN DEFAULT false;

   UPDATE inv_technician_pins
   SET is_admin = true
   WHERE technician_id = 'stan-tech-001';
   ```

   Then update `src/services/adminAuth.ts:30` to check:
   ```typescript
   .eq('is_admin', true)  // Uncomment this line
   ```

2. **Separate Admin Table**
   ```sql
   CREATE TABLE inv_admins (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     username VARCHAR(50) UNIQUE NOT NULL,
     pin_hash VARCHAR(64) NOT NULL,
     full_name VARCHAR(100),
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW(),
     last_login_at TIMESTAMP
   );
   ```

3. **Two-Factor Authentication** - Add email or SMS verification

4. **Audit Logging** - Track admin logins and actions

5. **Rate Limiting** - Prevent brute force attacks

6. **IP Whitelisting** - Restrict admin access to specific IPs

---

## 🧪 Testing the Authentication

### Test Successful Login:
1. Go to `/admin-login`
2. Enter PIN: `1234`
3. Should see "Welcome, Stan!"
4. Redirected to `/inventory/dashboard`
5. Should see "Logged in as Stan" in sidebar
6. Try navigating to other inventory pages - should work

### Test Failed Login:
1. Go to `/admin-login`
2. Enter PIN: `0000` (invalid)
3. Should see "Invalid admin PIN"
4. PIN should clear
5. Should not be logged in

### Test Protected Routes:
1. Clear localStorage (sign out if logged in)
2. Try to navigate to `/inventory/dashboard`
3. Should be redirected to `/admin-login`
4. Login with correct PIN
5. Should be redirected back to dashboard

### Test Sign Out:
1. Login as admin
2. Click "Sign Out" button in sidebar
3. Should be redirected to `/admin-login`
4. Try to access `/inventory/dashboard`
5. Should be redirected to `/admin-login` (not logged in)

### Test Session Timeout:
1. Login as admin
2. Manually change `loginTime` in localStorage to 25 hours ago:
   ```javascript
   const session = JSON.parse(localStorage.getItem('truck_inventory_admin_session'));
   session.loginTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
   localStorage.setItem('truck_inventory_admin_session', JSON.stringify(session));
   ```
3. Refresh page or navigate to `/inventory/dashboard`
4. Should be redirected to `/admin-login` (session expired)

---

## 🚨 Troubleshooting

### Problem: "Invalid admin PIN" but PIN is correct

**Solution:**
- Check that the PIN exists in `inv_technician_pins` table
- Verify the PIN is hashed correctly in the database
- Check that `is_active = true` for the technician

### Problem: Redirected to login after successful authentication

**Solution:**
- Check browser console for errors
- Verify localStorage is enabled
- Check that session is being saved:
  ```javascript
  console.log(localStorage.getItem('truck_inventory_admin_session'))
  ```

### Problem: Session expires too quickly

**Solution:**
- Session timeout is 24 hours by default
- To change, edit `src/services/adminAuth.ts:95`:
  ```typescript
  const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
  return hoursSinceLogin < 48 // Change 24 to 48 for 48 hours
  ```

### Problem: Can't access admin login from tablet

**Solution:**
- Admin login link is subtle (bottom of home page)
- Navigate directly to `/admin-login`
- Or add more prominent link if needed

---

## 📝 Usage Examples

### For Regular Admins:
```
1. Finish tablet work (checkout/return items)
2. Click "Sign Out" on home page
3. Click "Admin Access" at bottom
4. Enter your PIN
5. Access management dashboard
6. View reports, manage catalog, etc.
7. Click "Sign Out" when done
8. Or click "Back to Tablet App" to return to tablet mode
```

### For Managers:
```
1. Navigate directly to inventory.stantoncap.com/admin-login
2. Enter your PIN
3. View dashboard, transactions, reports
4. Manage inventory, trucks, technicians
5. Sign out when done
```

---

## 🔄 Migration from Old System

If you had manual admin access before:

1. **No changes required** - Existing technician PINs work as admin PINs
2. **To restrict access** - Add `is_admin` column and update specific users
3. **To audit access** - Check `last_login_at` in `inv_technician_pins` table

---

## 📊 Monitoring Admin Access

### View Recent Admin Logins:
```sql
SELECT
  technician_name,
  last_login_at
FROM inv_technician_pins
WHERE is_active = true
ORDER BY last_login_at DESC;
```

### Count Active Sessions:
```javascript
// In browser console
const sessions = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.includes('admin_session')) {
    sessions.push(localStorage.getItem(key));
  }
}
console.log('Active sessions:', sessions);
```

---

## 🎓 Best Practices

1. **Change default PINs** - Create unique PINs for admins
2. **Regular audits** - Review who has admin access
3. **Session timeout** - Keep 24-hour default for security
4. **Sign out** - Always sign out on shared devices
5. **Dedicated admin PINs** - Consider separate admin table
6. **Monitor access** - Check `last_login_at` regularly

---

## 🚀 Future Roadmap

**Phase 1 (Complete):**
- ✅ PIN-based authentication
- ✅ Protected routes
- ✅ Session management
- ✅ Sign out functionality

**Phase 2 (Recommended):**
- Add `is_admin` column to restrict access
- Audit logging for admin actions
- Rate limiting on login attempts
- Session activity tracking

**Phase 3 (Optional):**
- Two-factor authentication
- Password-based auth option
- Role-based permissions (view-only, full admin)
- IP whitelisting
- Admin dashboard for user management

---

## 📞 Support

**For issues or questions:**
1. Check this guide first
2. Review browser console for errors
3. Check Supabase logs for authentication errors
4. Verify database table structure and data

---

**Last Updated:** April 14, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
