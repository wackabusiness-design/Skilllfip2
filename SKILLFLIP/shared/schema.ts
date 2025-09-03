import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["learner", "creator", "admin"] }).default("learner"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 7 }), // hex color
  icon: varchar("icon", { length: 50 }), // icon name
  createdAt: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 300 }),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // minutes
  sessionType: varchar("session_type", { enum: ["virtual", "in-person", "both"] }).default("both"),
  location: varchar("location", { length: 200 }),
  mediaUrls: jsonb("media_urls").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  barterAccepted: boolean("barter_accepted").default(false),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  learnerId: varchar("learner_id").references(() => users.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  sessionDate: timestamp("session_date").notNull(),
  duration: integer("duration").notNull(), // minutes
  sessionType: varchar("session_type", { enum: ["virtual", "in-person"] }).notNull(),
  location: varchar("location", { length: 200 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  creatorEarnings: decimal("creator_earnings", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { 
    enum: ["pending", "confirmed", "in-progress", "completed", "cancelled", "refunded"] 
  }).default("pending"),
  paymentStatus: varchar("payment_status", { 
    enum: ["pending", "paid", "failed", "refunded"] 
  }).default("pending"),
  paymentIntentId: varchar("payment_intent_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  learnerId: varchar("learner_id").references(() => users.id).notNull(),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull(),
  location: varchar("location", { length: 200 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  maxAttendees: integer("max_attendees").notNull(),
  currentAttendees: integer("current_attendees").default(0),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  registrationDate: timestamp("registration_date").defaultNow(),
  paymentStatus: varchar("payment_status", { 
    enum: ["pending", "paid", "failed", "refunded"] 
  }).default("pending"),
});

export const creatorAvailability = pgTable("creator_availability", {
  id: serial("id").primaryKey(),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time", { length: 5 }).notNull(), // HH:MM format
  endTime: varchar("end_time", { length: 5 }).notNull(), // HH:MM format
  isAvailable: boolean("is_available").default(true),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdSkills: many(skills, { relationName: "creator" }),
  learnerBookings: many(bookings, { relationName: "learner" }),
  creatorBookings: many(bookings, { relationName: "creator" }),
  givenReviews: many(reviews, { relationName: "learner" }),
  receivedReviews: many(reviews, { relationName: "creator" }),
  eventRegistrations: many(eventRegistrations),
  availability: many(creatorAvailability),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  skills: many(skills),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  creator: one(users, {
    fields: [skills.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
  category: one(categories, {
    fields: [skills.categoryId],
    references: [categories.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  learner: one(users, {
    fields: [bookings.learnerId],
    references: [users.id],
    relationName: "learner",
  }),
  creator: one(users, {
    fields: [bookings.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
  skill: one(skills, {
    fields: [bookings.skillId],
    references: [skills.id],
  }),
  review: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  learner: one(users, {
    fields: [reviews.learnerId],
    references: [users.id],
    relationName: "learner",
  }),
  creator: one(users, {
    fields: [reviews.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
  skill: one(skills, {
    fields: [reviews.skillId],
    references: [skills.id],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
}));

export const creatorAvailabilityRelations = relations(creatorAvailability, ({ one }) => ({
  creator: one(users, {
    fields: [creatorAvailability.creatorId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  slug: true,
  color: true,
  icon: true,
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  title: true,
  description: true,
  shortDescription: true,
  categoryId: true,
  price: true,
  duration: true,
  sessionType: true,
  location: true,
  mediaUrls: true,
  tags: true,
  barterAccepted: true,
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  skillId: true,
  sessionDate: true,
  duration: true,
  sessionType: true,
  location: true,
  notes: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  bookingId: true,
  rating: true,
  comment: true,
  isPublic: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  eventDate: true,
  location: true,
  price: true,
  maxAttendees: true,
  imageUrl: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).pick({
  eventId: true,
});

export const insertCreatorAvailabilitySchema = createInsertSchema(creatorAvailability).pick({
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  isAvailable: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertCreatorAvailability = z.infer<typeof insertCreatorAvailabilitySchema>;
export type CreatorAvailability = typeof creatorAvailability.$inferSelect;
