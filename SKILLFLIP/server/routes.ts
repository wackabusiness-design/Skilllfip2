import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertSkillSchema, 
  insertBookingSchema, 
  insertReviewSchema,
  insertEventSchema,
  insertEventRegistrationSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Skills
  app.get('/api/skills', async (req, res) => {
    try {
      const {
        category,
        search,
        location,
        sessionType,
        minPrice,
        maxPrice,
        featured,
      } = req.query;

      const filters = {
        category: category ? parseInt(category as string) : undefined,
        search: search as string,
        location: location as string,
        sessionType: sessionType as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        isApproved: true,
        isFeatured: featured === 'true' ? true : undefined,
      };

      const skills = await storage.getSkills(filters);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get('/api/skills/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const skill = await storage.getSkillById(id);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }

      res.json(skill);
    } catch (error) {
      console.error("Error fetching skill:", error);
      res.status(500).json({ message: "Failed to fetch skill" });
    }
  });

  app.post('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const skillData = insertSkillSchema.parse(req.body);
      
      const skill = await storage.createSkill({
        ...skillData,
        creatorId: userId,
      });

      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid skill data", errors: error.errors });
      }
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.get('/api/creators/:id/skills', async (req, res) => {
    try {
      const creatorId = req.params.id;
      const skills = await storage.getSkillsByCreator(creatorId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching creator skills:", error);
      res.status(500).json({ message: "Failed to fetch creator skills" });
    }
  });

  // Bookings
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.query;

      let filters = {};
      if (type === 'learner') {
        filters = { learnerId: userId };
      } else if (type === 'creator') {
        filters = { creatorId: userId };
      }

      const bookings = await storage.getBookings(filters);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const learnerId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Get skill details to calculate pricing
      const skill = await storage.getSkillById(bookingData.skillId);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }

      const skillPrice = parseFloat(skill.price);
      const duration = bookingData.duration;
      const hourlyRate = skillPrice;
      const totalAmount = (hourlyRate * duration) / 60; // duration in minutes
      const platformFee = totalAmount * 0.25; // 25% platform fee
      const creatorEarnings = totalAmount - platformFee;

      const booking = await storage.createBooking({
        ...bookingData,
        learnerId,
        creatorId: skill.creatorId,
        totalAmount: totalAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        creatorEarnings: creatorEarnings.toFixed(2),
      });

      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch('/api/bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const booking = await storage.updateBookingStatus(id, status);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Reviews
  app.get('/api/skills/:skillId/reviews', async (req, res) => {
    try {
      const skillId = parseInt(req.params.skillId);
      const reviews = await storage.getReviewsBySkill(skillId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/creators/:creatorId/reviews', async (req, res) => {
    try {
      const creatorId = req.params.creatorId;
      const reviews = await storage.getReviewsByCreator(creatorId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching creator reviews:", error);
      res.status(500).json({ message: "Failed to fetch creator reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const learnerId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse(req.body);
      
      // Get booking details to ensure user can review
      const booking = await storage.getBookingById(reviewData.bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.learnerId !== learnerId) {
        return res.status(403).json({ message: "Not authorized to review this booking" });
      }

      const review = await storage.createReview({
        ...reviewData,
        learnerId,
        creatorId: booking.creatorId,
        skillId: booking.skillId,
      });

      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Events
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents(true);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events/:id/register', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const registration = await storage.registerForEvent({
        eventId,
        userId,
      });

      res.status(201).json(registration);
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  // Creator availability
  app.get('/api/creators/:id/availability', async (req, res) => {
    try {
      const creatorId = req.params.id;
      const availability = await storage.getCreatorAvailability(creatorId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/skills/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const skills = await storage.getSkills({ isApproved: false });
      res.json(skills);
    } catch (error) {
      console.error("Error fetching pending skills:", error);
      res.status(500).json({ message: "Failed to fetch pending skills" });
    }
  });

  app.patch('/api/admin/skills/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const skill = await storage.approveSkill(id);
      res.json(skill);
    } catch (error) {
      console.error("Error approving skill:", error);
      res.status(500).json({ message: "Failed to approve skill" });
    }
  });

  // Mock payment endpoint for MVP
  app.post('/api/create-payment-intent', isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      
      // Mock payment intent for MVP
      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        status: 'requires_payment_method',
      };

      res.json({ clientSecret: mockPaymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
