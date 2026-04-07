# Petjio Admin Panel

A modern, responsive admin panel built with React, Vite, and Tailwind CSS for managing the Petjio pet services platform.

## Features

- 🔐 **Protected Routes** - Authentication required for all admin pages
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean design with Tailwind CSS
- 🔍 **Search & Filter** - Easy data management
- 📊 **Dashboard** - Overview of key metrics
- 👥 **User Management** - Manage platform users
- 🏪 **Vendor Management** - Handle vendor accounts
- ⚙️ **Service Management** - Configure available services
- 📝 **Form Management** - Create and manage service forms
- 👤 **Profile Settings** - Admin profile management

## Pages

1. **Overview** - Dashboard with stats and recent activity
2. **Services** - Manage pet services and categories
3. **User Management** - View and manage users
4. **Vendor Management** - Handle vendor accounts and approvals
5. **Service Form Management** - Create and manage service request forms
6. **Profile** - Admin profile and settings

## Getting Started

1. **Install Dependencies**
   ```bash
   cd admin
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Admin Panel**
   - Open http://localhost:3001
   - Use any email and password to login (demo mode)

## Authentication

The admin panel uses protected routes with JWT token authentication. In demo mode, any email/password combination will work. For production, connect to your backend API endpoints.

## Backend Integration

Update the API endpoints in:
- `src/context/AuthContext.jsx` - Authentication
- Individual page components - Data fetching

## Build for Production

```bash
npm run build
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **Axios** - HTTP client

## Project Structure

```
admin/
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # React context (Auth)
│   ├── pages/          # Page components
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── package.json        # Dependencies
```