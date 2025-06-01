
import mongoose, { Schema, Document } from 'mongoose';

// User interface and schema
export interface IUser extends Document {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  password?: string;
}

const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
  password: String,
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);

// Portfolio Item interface and schema
export interface IPortfolioItem extends Document {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioItemSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  imageUrl: String,
  projectUrl: String,
  githubUrl: String,
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export const PortfolioItem = mongoose.model<IPortfolioItem>('PortfolioItem', portfolioItemSchema);

// Case Study interface and schema
export interface ICaseStudy extends Document {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const caseStudySchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: String,
  technologies: [{ type: String }],
  projectUrl: String,
  githubUrl: String,
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export const CaseStudy = mongoose.model<ICaseStudy>('CaseStudy', caseStudySchema);

// Contact Message interface and schema
export interface IContactMessage extends Document {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const contactMessageSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);

// Export types for compatibility
export type InsertUser = Omit<IUser, keyof Document>;
export type InsertPortfolioItem = Omit<IPortfolioItem, keyof Document>;
export type InsertCaseStudy = Omit<ICaseStudy, keyof Document>;
export type InsertContactMessage = Omit<IContactMessage, keyof Document>;

// Validation schemas (you can use zod for validation)
import { z } from 'zod';

export const insertUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  password: z.string().optional(),
});

export const insertPortfolioItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  technologies: z.array(z.string()),
  imageUrl: z.string().optional(),
  projectUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  featured: z.boolean().default(false),
});

export const insertCaseStudySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().optional(),
  technologies: z.array(z.string()),
  projectUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  featured: z.boolean().default(false),
});

export const insertContactMessageSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  read: z.boolean().default(false),
});
