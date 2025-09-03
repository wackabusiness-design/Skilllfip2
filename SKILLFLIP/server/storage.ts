import {
  users,
  categories,
  skills,
  bookings,
  reviews,
  events,
  eventRegistrations,
  creatorAvailability,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Skill,
  type InsertSkill,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type Event,
  type InsertEvent,
  type EventRegistration,
  type InsertEventRegistration,
  type CreatorAvailability,
  type InsertCreatorAvailability,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, ilike, sql, count, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Skill operations
  getSkills(filters?: {
    category?: number;
    search?: string;
    location?: string;
    sessionType?: string;
    minPrice?: number;
    maxPrice?: number;
    isApproved?: boolean;
    isFeatured?: boolean;
  }): Promise<(Skill & { creator: User; category: Category })[]>;
  getSkillById(id: number): Promise<(Skill & { creator: User; category: Category }) | undefined>;
  getSkillsByCreator(creatorId: string): Promise<(Skill & { category: Category })[]>;
  createSkill(skill: InsertSkill & { creatorId: string }): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill>;
  approveSkill(id: number): Promise<Skill>;
  featureSkill(id: number, featured: boolean): Promise<Skill>;
  
  // Booking operations
  getBookings(filters?: {
    learnerId?: string;
    creatorId?: string;
    status?: string;
  }): Promise<(Booking & { learner: User; creator: User; skill: Skill })[]>;
  getBookingById(id: number): Promise<(Booking & { learner: User; creator: User; skill: Skill }) | undefined>;
  createBooking(booking: InsertBooking & { learnerId: string; creatorId: string; totalAmount: string; platformFee: string; creatorEarnings: string }): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  updateBookingPayment(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Booking>;
  
  // Review operations
  getReviewsBySkill(skillId: number): Promise<(Review & { learner: User })[]>;
  getReviewsByCreator(creatorId: string): Promise<(Review & { learner: User; skill: Skill })[]>;
  createReview(review: InsertReview & { learnerId: string; creatorId: string; skillId: number }): Promise<Review>;
  
  // Event operations
  getEvents(activeOnly?: boolean): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  registerForEvent(registration: InsertEventRegistration & { userId: string }): Promise<EventRegistration>;
  
  // Creator availability operations
  getCreatorAvailability(creatorId: string): Promise<CreatorAvailability[]>;
  setCreatorAvailability(creatorId: string, availability: InsertCreatorAvailability[]): Promise<CreatorAvailability[]>;
  
  // Admin operations
  getPlatformStats(): Promise<{
    totalUsers: number;
    totalSkills: number;
    totalBookings: number;
    totalRevenue: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Skill operations
  async getSkills(filters?: {
    category?: number;
    search?: string;
    location?: string;
    sessionType?: string;
    minPrice?: number;
    maxPrice?: number;
    isApproved?: boolean;
    isFeatured?: boolean;
  }): Promise<(Skill & { creator: User; category: Category })[]> {
    const conditions = [eq(skills.isActive, true)];

    if (filters?.category) {
      conditions.push(eq(skills.categoryId, filters.category));
    }

    if (filters?.search) {
      conditions.push(like(skills.title, `%${filters.search}%`));
    }

    if (filters?.location) {
      conditions.push(like(skills.location, `%${filters.location}%`));
    }

    if (filters?.sessionType && filters.sessionType !== 'both') {
      conditions.push(eq(skills.sessionType, filters.sessionType as any));
    }

    if (filters?.minPrice) {
      conditions.push(sql`${skills.price} >= ${filters.minPrice}`);
    }

    if (filters?.maxPrice) {
      conditions.push(sql`${skills.price} <= ${filters.maxPrice}`);
    }

    if (filters?.isApproved !== undefined) {
      conditions.push(eq(skills.isApproved, filters.isApproved));
    }

    if (filters?.isFeatured !== undefined) {
      conditions.push(eq(skills.isFeatured, filters.isFeatured));
    }

    const results = await db
      .select()
      .from(skills)
      .innerJoin(users, eq(skills.creatorId, users.id))
      .innerJoin(categories, eq(skills.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(skills.isFeatured), desc(skills.createdAt));

    return results.map(result => ({
      ...result.skills,
      creator: result.users,
      category: result.categories,
    }));
  }

  async getSkillById(id: number): Promise<(Skill & { creator: User; category: Category }) | undefined> {
    const [result] = await db
      .select()
      .from(skills)
      .innerJoin(users, eq(skills.creatorId, users.id))
      .innerJoin(categories, eq(skills.categoryId, categories.id))
      .where(eq(skills.id, id));

    if (!result) return undefined;

    return {
      ...result.skills,
      creator: result.users,
      category: result.categories,
    };
  }

  async getSkillsByCreator(creatorId: string): Promise<(Skill & { category: Category })[]> {
    const results = await db
      .select()
      .from(skills)
      .innerJoin(categories, eq(skills.categoryId, categories.id))
      .where(eq(skills.creatorId, creatorId))
      .orderBy(desc(skills.createdAt));

    return results.map(result => ({
      ...result.skills,
      category: result.categories,
    }));
  }

  async createSkill(skill: InsertSkill & { creatorId: string }): Promise<Skill> {
    const [newSkill] = await db
      .insert(skills)
      .values(skill)
      .returning();
    return newSkill;
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill> {
    const [updatedSkill] = await db
      .update(skills)
      .set({ ...skill, updatedAt: new Date() })
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }

  async approveSkill(id: number): Promise<Skill> {
    const [updatedSkill] = await db
      .update(skills)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }

  async featureSkill(id: number, featured: boolean): Promise<Skill> {
    const [updatedSkill] = await db
      .update(skills)
      .set({ isFeatured: featured, updatedAt: new Date() })
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }

  // Booking operations
  async getBookings(filters?: {
    learnerId?: string;
    creatorId?: string;
    status?: string;
  }): Promise<(Booking & { learner: User; creator: User; skill: Skill })[]> {
    let query = db
      .select()
      .from(bookings)
      .innerJoin(users, eq(bookings.learnerId, users.id))
      .innerJoin(skills, eq(bookings.skillId, skills.id));

    const conditions = [];

    if (filters?.learnerId) {
      conditions.push(eq(bookings.learnerId, filters.learnerId));
    }

    if (filters?.creatorId) {
      conditions.push(eq(bookings.creatorId, filters.creatorId));
    }

    if (filters?.status) {
      conditions.push(eq(bookings.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(bookings.createdAt));

    // Get creator info for each booking
    const bookingsWithCreator = await Promise.all(
      results.map(async (result) => {
        const [creator] = await db
          .select()
          .from(users)
          .where(eq(users.id, result.bookings.creatorId));

        return {
          ...result.bookings,
          learner: result.users,
          creator,
          skill: result.skills,
        };
      })
    );

    return bookingsWithCreator;
  }

  async getBookingById(id: number): Promise<(Booking & { learner: User; creator: User; skill: Skill }) | undefined> {
    const [result] = await db
      .select()
      .from(bookings)
      .innerJoin(users, eq(bookings.learnerId, users.id))
      .innerJoin(skills, eq(bookings.skillId, skills.id))
      .where(eq(bookings.id, id));

    if (!result) return undefined;

    const [creator] = await db
      .select()
      .from(users)
      .where(eq(users.id, result.bookings.creatorId));

    return {
      ...result.bookings,
      learner: result.users,
      creator,
      skill: result.skills,
    };
  }

  async createBooking(booking: InsertBooking & { 
    learnerId: string; 
    creatorId: string; 
    totalAmount: string; 
    platformFee: string; 
    creatorEarnings: string; 
  }): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async updateBookingPayment(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ 
        paymentStatus, 
        paymentIntentId, 
        updatedAt: new Date() 
      })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Review operations
  async getReviewsBySkill(skillId: number): Promise<(Review & { learner: User })[]> {
    const results = await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.learnerId, users.id))
      .where(and(eq(reviews.skillId, skillId), eq(reviews.isPublic, true)))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.reviews,
      learner: result.users,
    }));
  }

  async getReviewsByCreator(creatorId: string): Promise<(Review & { learner: User; skill: Skill })[]> {
    const results = await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.learnerId, users.id))
      .innerJoin(skills, eq(reviews.skillId, skills.id))
      .where(and(eq(reviews.creatorId, creatorId), eq(reviews.isPublic, true)))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.reviews,
      learner: result.users,
      skill: result.skills,
    }));
  }

  async createReview(review: InsertReview & { 
    learnerId: string; 
    creatorId: string; 
    skillId: number; 
  }): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  // Event operations
  async getEvents(activeOnly = false): Promise<Event[]> {
    let query = db.select().from(events);

    if (activeOnly) {
      query = query.where(eq(events.isActive, true));
    }

    return await query.orderBy(asc(events.eventDate));
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async registerForEvent(registration: InsertEventRegistration & { userId: string }): Promise<EventRegistration> {
    const [newRegistration] = await db
      .insert(eventRegistrations)
      .values(registration)
      .returning();
    return newRegistration;
  }

  // Creator availability operations
  async getCreatorAvailability(creatorId: string): Promise<CreatorAvailability[]> {
    return await db
      .select()
      .from(creatorAvailability)
      .where(eq(creatorAvailability.creatorId, creatorId))
      .orderBy(asc(creatorAvailability.dayOfWeek), asc(creatorAvailability.startTime));
  }

  async setCreatorAvailability(creatorId: string, availability: InsertCreatorAvailability[]): Promise<CreatorAvailability[]> {
    // Delete existing availability
    await db
      .delete(creatorAvailability)
      .where(eq(creatorAvailability.creatorId, creatorId));

    // Insert new availability
    if (availability.length > 0) {
      const availabilityWithCreator = availability.map(av => ({
        ...av,
        creatorId,
      }));

      return await db
        .insert(creatorAvailability)
        .values(availabilityWithCreator)
        .returning();
    }

    return [];
  }

  // Admin operations
  async getPlatformStats(): Promise<{
    totalUsers: number;
    totalSkills: number;
    totalBookings: number;
    totalRevenue: string;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [skillCount] = await db.select({ count: count() }).from(skills);
    const [bookingCount] = await db.select({ count: count() }).from(bookings);
    
    const [revenueResult] = await db
      .select({ 
        total: sql<string>`COALESCE(SUM(${bookings.platformFee}), 0)` 
      })
      .from(bookings)
      .where(eq(bookings.paymentStatus, 'paid'));

    return {
      totalUsers: userCount.count,
      totalSkills: skillCount.count,
      totalBookings: bookingCount.count,
      totalRevenue: revenueResult.total || '0',
    };
  }
}

export const storage = new DatabaseStorage();
