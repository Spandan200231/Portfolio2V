# Render.com Deployment Guide

## Environment Variables Required

Set these environment variables in your Render service dashboard:

### Database
- `DATABASE_URL` - Your PostgreSQL database connection string from Render

### Authentication (Optional)
- `ADMIN_EMAIL` - Admin email address (default: admin@portfolio.com)
- `ADMIN_PASSWORD` - Admin password (default: admin123)
- `SESSION_SECRET` - A random secure string (generate one)

### Application
- `NODE_ENV=production`

## Admin Access

The application uses email/password authentication with a default admin account:
- **Email**: admin@portfolio.com
- **Password**: admin123

You can customize these credentials by setting the `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables.

## Database Setup

After deployment, your database tables will be created automatically when the app starts. The default admin user will also be created automatically.

## Build Configuration

Render will automatically:
1. Run `npm install`
2. Run `npm run build` 
3. Start the app with `npm start`

The app will be available on the port assigned by Render.

## Security Notes

- Change the default admin credentials in production
- Use a strong, random `SESSION_SECRET` 
- The password is securely hashed using bcrypt