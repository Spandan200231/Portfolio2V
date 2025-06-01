# Render.com Deployment Guide

## Environment Variables Required

Set these environment variables in your Render service dashboard:

### Database
- `DATABASE_URL` - Your PostgreSQL database connection string from Render

### Authentication  
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
- `SESSION_SECRET` - A random secure string (generate one)

### Application
- `NODE_ENV=production`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your Render domain to authorized origins:
   - `https://your-app-name.onrender.com`
6. Add callback URL:
   - `https://your-app-name.onrender.com/api/auth/google/callback`

## Database Setup

After deployment, your database tables will be created automatically when the app starts.

## Build Configuration

Render will automatically:
1. Run `npm install`
2. Run `npm run build` 
3. Start the app with `npm start`

The app will be available on the port assigned by Render.