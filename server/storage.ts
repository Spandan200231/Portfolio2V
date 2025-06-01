import { nanoid } from 'nanoid';
import { 
  User, 
  PortfolioItem, 
  CaseStudy, 
  ContactMessage,
  type IUser,
  type IPortfolioItem,
  type ICaseStudy,
  type IContactMessage,
  type InsertUser,
  type InsertPortfolioItem,
  type InsertCaseStudy,
  type InsertContactMessage
} from '@shared/schema';

export async function getUserByEmail(email: string): Promise<IUser | null> {
  return await User.findOne({ email });
}

export async function getUserById(id: string): Promise<IUser | null> {
  return await User.findOne({ id });
}

export async function upsertUser(user: InsertUser): Promise<IUser> {
  const existingUser = await User.findOne({ id: user.id });
  if (existingUser) {
    Object.assign(existingUser, user);
    return await existingUser.save();
  } else {
    return await User.create(user);
  }
}

export async function getPortfolioItems(): Promise<IPortfolioItem[]> {
  return await PortfolioItem.find().sort({ createdAt: -1 });
}

export async function getPortfolioItemById(id: string): Promise<IPortfolioItem | null> {
  return await PortfolioItem.findOne({ id });
}

export async function getFeaturedPortfolioItems(): Promise<IPortfolioItem[]> {
  return await PortfolioItem.find({ featured: true }).sort({ createdAt: -1 });
}

export async function createPortfolioItem(item: Omit<InsertPortfolioItem, 'id'>): Promise<IPortfolioItem> {
  const portfolioItem = {
    ...item,
    id: nanoid()
  };
  return await PortfolioItem.create(portfolioItem);
}

export async function updatePortfolioItem(id: string, updates: Partial<InsertPortfolioItem>): Promise<IPortfolioItem | null> {
  return await PortfolioItem.findOneAndUpdate({ id }, updates, { new: true });
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  const result = await PortfolioItem.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function getCaseStudies(): Promise<ICaseStudy[]> {
  return await CaseStudy.find().sort({ createdAt: -1 });
}

export async function getCaseStudyById(id: string): Promise<ICaseStudy | null> {
  return await CaseStudy.findOne({ id });
}

export async function getFeaturedCaseStudies(): Promise<ICaseStudy[]> {
  return await CaseStudy.find({ featured: true }).sort({ createdAt: -1 });
}

export async function createCaseStudy(caseStudy: Omit<InsertCaseStudy, 'id'>): Promise<ICaseStudy> {
  const newCaseStudy = {
    ...caseStudy,
    id: nanoid()
  };
  return await CaseStudy.create(newCaseStudy);
}

export async function updateCaseStudy(id: string, updates: Partial<InsertCaseStudy>): Promise<ICaseStudy | null> {
  return await CaseStudy.findOneAndUpdate({ id }, updates, { new: true });
}

export async function deleteCaseStudy(id: string): Promise<boolean> {
  const result = await CaseStudy.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function getContactMessages(): Promise<IContactMessage[]> {
  return await ContactMessage.find().sort({ createdAt: -1 });
}

export async function createContactMessage(message: Omit<InsertContactMessage, 'id'>): Promise<IContactMessage> {
  const contactMessage = {
    ...message,
    id: nanoid()
  };
  return await ContactMessage.create(contactMessage);
}

export async function markMessageAsRead(id: string): Promise<IContactMessage | null> {
  return await ContactMessage.findOneAndUpdate({ id }, { read: true }, { new: true });
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const result = await ContactMessage.deleteOne({ id });
  return result.deletedCount > 0;
}

// Create storage object
export const storage = {
  getUserByEmail,
  getUserById,
  upsertUser,
  getPortfolioItems,
  getPortfolioItemById,
  getFeaturedPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getCaseStudies,
  getCaseStudyById,
  getFeaturedCaseStudies,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  getContactMessages,
  createContactMessage,
  markMessageAsRead,
  deleteContactMessage,
};

// Export all functions for use in routes
export {
  getUserByEmail,
  getUserById,
  upsertUser,
  getPortfolioItems,
  getPortfolioItemById,
  getFeaturedPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getCaseStudies,
  getCaseStudyById,
  getFeaturedCaseStudies,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  getContactMessages,
  createContactMessage,
  markMessageAsRead,
  deleteContactMessage,
};