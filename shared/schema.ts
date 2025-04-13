import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// User health profile
export const healthProfiles = pgTable("health_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  respiratoryConditions: json("respiratory_conditions").$type<string[]>(),
  hasRespiratoryConditions: boolean("has_respiratory_conditions").notNull().default(false),
  allergies: json("allergies").$type<string[]>(),
  hasAllergies: boolean("has_allergies").notNull().default(false),
  cardiovascularConcerns: boolean("cardiovascular_concerns").notNull().default(false),
  skinConditions: boolean("skin_conditions").notNull().default(false),
  fitnessLevel: text("fitness_level"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User lifestyle habits
export const lifestyleHabits = pgTable("lifestyle_habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dailyRoutine: text("daily_routine"),
  transportation: json("transportation").$type<string[]>(),
  dietaryPreferences: json("dietary_preferences").$type<string[]>(),
  sleepHabits: text("sleep_habits"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User environmental sensitivities
export const environmentalSensitivities = pgTable("environmental_sensitivities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pollutionSensitivity: integer("pollution_sensitivity").notNull().default(3),
  uvSensitivity: integer("uv_sensitivity").notNull().default(3),
  heatSensitivity: integer("heat_sensitivity").notNull().default(3),
  coldSensitivity: integer("cold_sensitivity").notNull().default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User interests and preferences
export const interests = pgTable("interests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  outdoorActivities: json("outdoor_activities").$type<string[]>(),
  clothingStyle: text("clothing_style"),
  sustainabilityInterest: integer("sustainability_interest").notNull().default(3),
  notifications: json("notifications").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Surveys for tracking completion status
export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  completed: boolean("completed").notNull().default(false),
  lastStep: integer("last_step").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community polls
export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  options: json("options").$type<string[]>().notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Poll votes
export const pollVotes = pgTable("poll_votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull().references(() => polls.id),
  userId: integer("user_id").notNull().references(() => users.id),
  optionIndex: integer("option_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat histories
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  messages: json("messages").$type<{role: string, content: string}[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User schema (for insertion)
export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Health profile schema
export const insertHealthProfileSchema = createInsertSchema(healthProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHealthProfile = z.infer<typeof insertHealthProfileSchema>;
export type HealthProfile = typeof healthProfiles.$inferSelect;

// Lifestyle habits schema
export const insertLifestyleHabitsSchema = createInsertSchema(lifestyleHabits).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLifestyleHabits = z.infer<typeof insertLifestyleHabitsSchema>;
export type LifestyleHabits = typeof lifestyleHabits.$inferSelect;

// Environmental sensitivities schema
export const insertEnvironmentalSensitivitiesSchema = createInsertSchema(environmentalSensitivities).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEnvironmentalSensitivities = z.infer<typeof insertEnvironmentalSensitivitiesSchema>;
export type EnvironmentalSensitivities = typeof environmentalSensitivities.$inferSelect;

// Interests schema
export const insertInterestsSchema = createInsertSchema(interests).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInterests = z.infer<typeof insertInterestsSchema>;
export type Interests = typeof interests.$inferSelect;

// Survey schema
export const insertSurveySchema = createInsertSchema(surveys).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveys.$inferSelect;

// Poll schema
export const insertPollSchema = createInsertSchema(polls).omit({ id: true, createdAt: true });
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Poll = typeof polls.$inferSelect;

// Poll vote schema
export const insertPollVoteSchema = createInsertSchema(pollVotes).omit({ id: true, createdAt: true });
export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;
export type PollVote = typeof pollVotes.$inferSelect;

// Chat history schema
export const insertChatHistorySchema = createInsertSchema(chatHistory).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type ChatHistory = typeof chatHistory.$inferSelect;

// Combined user profile schema
export const userProfileSchema = z.object({
  healthProfile: insertHealthProfileSchema.omit({ userId: true }).optional(),
  lifestyleHabits: insertLifestyleHabitsSchema.omit({ userId: true }).optional(),
  environmentalSensitivities: insertEnvironmentalSensitivitiesSchema.omit({ userId: true }).optional(),
  interests: insertInterestsSchema.omit({ userId: true }).optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
