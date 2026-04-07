# Admin Panel Setup Instructions

## 1. Install Dependencies
```bash
cd admin
npm install
```

## 2. Start Development Server
```bash
npm run dev
```

## 3. Access Admin Panel
- Open http://localhost:3001
- Login with any email/password (demo mode)

## 4. Troubleshooting CSS Issues

If Tailwind CSS is not working:

1. **Check if PostCSS is configured:**
   - Make sure `postcss.config.js` exists
   - Verify `tailwind.config.js` is properly set up

2. **Restart the development server:**
   ```bash
   npm run dev
   ```

3. **Clear browser cache and hard refresh**

4. **Check console for errors**

## 5. Backend Integration

The admin panel is configured to work with these API endpoints:

### Auth Endpoints (Already exist in backend):
- `POST /api/auth/admin/login`
- `POST /api/auth/admin/logout`
- `POST /api/auth/admin/refresh-token`

### Additional endpoints needed (create these in backend):
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/dashboard/activity`
- `GET /api/admin/users`
- `GET /api/admin/vendors`
- `GET /api/admin/services`
- `GET /api/admin/service-forms`
- `GET /api/admin/profile`
- `PUT /api/admin/profile`

## 6. Environment Variables

Make sure `.env` file exists with:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Petjio Admin Panel
```

## 7. Features Implemented

✅ Protected Routes with JWT Authentication
✅ Responsive Design with Tailwind CSS
✅ Dashboard with Stats and Activity
✅ User Management with API Integration
✅ Vendor Management
✅ Service Management
✅ Service Form Management
✅ Profile Management
✅ Axios Instance with Interceptors
✅ Error Handling
✅ Loading States