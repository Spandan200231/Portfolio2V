import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertPortfolioItemSchema,
  insertCaseStudySchema,
  insertContactMessageSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  app.get("/api/portfolio", async (req, res) => {
    try {
      const items = await storage.getPortfolioItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
      res.status(500).json({ message: "Failed to fetch portfolio items" });
    }
  });

  app.get("/api/portfolio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getPortfolioItem(id);
      if (!item) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching portfolio item:", error);
      res.status(500).json({ message: "Failed to fetch portfolio item" });
    }
  });

  app.get("/api/case-studies", async (req, res) => {
    try {
      const studies = await storage.getCaseStudies();
      res.json(studies);
    } catch (error) {
      console.error("Error fetching case studies:", error);
      res.status(500).json({ message: "Failed to fetch case studies" });
    }
  });

  app.get("/api/case-studies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const study = await storage.getCaseStudy(id);
      if (!study) {
        return res.status(404).json({ message: "Case study not found" });
      }
      res.json(study);
    } catch (error) {
      console.error("Error fetching case study:", error);
      res.status(500).json({ message: "Failed to fetch case study" });
    }
  });

  app.post("/api/contact", upload.single("attachment"), async (req, res) => {
    try {
      const result = insertContactMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.issues });
      }

      const messageData = result.data;
      
      // Handle file attachment
      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.renameSync(req.file.path, filePath);
        
        messageData.attachmentUrl = `/uploads/${fileName}`;
        messageData.attachmentName = req.file.originalname;
      }

      const message = await storage.createContactMessage(messageData);
      res.json({ message: "Message sent successfully", id: message.id });
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Protected admin routes
  app.get("/api/admin/portfolio", isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getPortfolioItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
      res.status(500).json({ message: "Failed to fetch portfolio items" });
    }
  });

  app.post("/api/admin/portfolio", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      const result = insertPortfolioItemSchema.safeParse({
        ...req.body,
        technologies: JSON.parse(req.body.technologies || "[]"),
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.issues });
      }

      const itemData = result.data;
      
      // Handle image upload
      if (req.file) {
        const fileName = `portfolio-${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.renameSync(req.file.path, filePath);
        itemData.imageUrl = `/uploads/${fileName}`;
      }

      const item = await storage.createPortfolioItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating portfolio item:", error);
      res.status(500).json({ message: "Failed to create portfolio item" });
    }
  });

  app.put("/api/admin/portfolio/:id", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertPortfolioItemSchema.partial().safeParse({
        ...req.body,
        technologies: req.body.technologies ? JSON.parse(req.body.technologies) : undefined,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.issues });
      }

      const itemData = result.data;
      
      // Handle image upload
      if (req.file) {
        const fileName = `portfolio-${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.renameSync(req.file.path, filePath);
        itemData.imageUrl = `/uploads/${fileName}`;
      }

      const item = await storage.updatePortfolioItem(id, itemData);
      res.json(item);
    } catch (error) {
      console.error("Error updating portfolio item:", error);
      res.status(500).json({ message: "Failed to update portfolio item" });
    }
  });

  app.delete("/api/admin/portfolio/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePortfolioItem(id);
      res.json({ message: "Portfolio item deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      res.status(500).json({ message: "Failed to delete portfolio item" });
    }
  });

  // Case studies admin routes
  app.get("/api/admin/case-studies", isAuthenticated, async (req, res) => {
    try {
      const studies = await storage.getCaseStudies();
      res.json(studies);
    } catch (error) {
      console.error("Error fetching case studies:", error);
      res.status(500).json({ message: "Failed to fetch case studies" });
    }
  });

  app.post("/api/admin/case-studies", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      const result = insertCaseStudySchema.safeParse({
        ...req.body,
        tags: JSON.parse(req.body.tags || "[]"),
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.issues });
      }

      const studyData = result.data;
      
      // Handle image upload
      if (req.file) {
        const fileName = `case-study-${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.renameSync(req.file.path, filePath);
        studyData.imageUrl = `/uploads/${fileName}`;
      }

      const study = await storage.createCaseStudy(studyData);
      res.json(study);
    } catch (error) {
      console.error("Error creating case study:", error);
      res.status(500).json({ message: "Failed to create case study" });
    }
  });

  app.put("/api/admin/case-studies/:id", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertCaseStudySchema.partial().safeParse({
        ...req.body,
        tags: req.body.tags ? JSON.parse(req.body.tags) : undefined,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.issues });
      }

      const studyData = result.data;
      
      // Handle image upload
      if (req.file) {
        const fileName = `case-study-${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.renameSync(req.file.path, filePath);
        studyData.imageUrl = `/uploads/${fileName}`;
      }

      const study = await storage.updateCaseStudy(id, studyData);
      res.json(study);
    } catch (error) {
      console.error("Error updating case study:", error);
      res.status(500).json({ message: "Failed to update case study" });
    }
  });

  app.delete("/api/admin/case-studies/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCaseStudy(id);
      res.json({ message: "Case study deleted successfully" });
    } catch (error) {
      console.error("Error deleting case study:", error);
      res.status(500).json({ message: "Failed to delete case study" });
    }
  });

  // Messages admin routes
  app.get("/api/admin/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.put("/api/admin/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markMessageAsRead(id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.delete("/api/admin/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContactMessage(id);
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Admin settings routes
  app.get("/api/admin/settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getAdminSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", isAuthenticated, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      
      const setting = await storage.updateAdminSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
