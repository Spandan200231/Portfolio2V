import express, { type Express } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import * as storage from "./storage";

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@portfolio.com";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  return session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      ttl: sessionTtl / 1000, // convert to seconds
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Set up local strategy for email/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password || '');
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      });
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, cb) => cb(null, user));
passport.deserializeUser((user: any, cb) => cb(null, user));

async function createDefaultAdmin() {
  try {
    const existingUser = await storage.getUserByEmail(DEFAULT_ADMIN_EMAIL);
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      await storage.upsertUser({
        id: "admin",
        email: DEFAULT_ADMIN_EMAIL,
        firstName: "Admin",
        lastName: "User",
        profileImageUrl: null,
        password: hashedPassword,
      });
      console.log(`Default admin user created with email: ${DEFAULT_ADMIN_EMAIL}`);
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Create default admin user
  await createDefaultAdmin();

  // Add auth routes
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}