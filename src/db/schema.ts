import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, doublePrecision } from 'drizzle-orm/pg-core';

// 1. Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('student'), // 'student' or 'admin'
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Spots table (Eating, drinking, shopping)
export const spots = pgTable('spots', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'food', 'drink', 'shopping'
  address: text('address').notNull(),
  school: text('school').default('FPT University'), 
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  wifi: boolean('wifi').default(false),
  studySpot: boolean('study_spot').default(false),
  priceRange: text('price_range'), // e.g. "20k-50k", "50k-100k"
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Deals table (Discounts, combo deals)
export const deals = pgTable('deals', {
  id: serial('id').primaryKey(),
  spotId: integer('spot_id')
    .references(() => spots.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  discountCode: text('discount_code'),
  expiryDate: text('expiry_date'), // e.g. "2026-12-31" atau text
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Menu Items table (Individual items with price & photo)
export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  spotId: integer('spot_id')
    .references(() => spots.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  price: integer('price').notNull(), // standard price in VND
  image: text('image'), // real food photo URL
  isPopular: boolean('is_popular').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Sheet Configuration (To let admin input dynamic Google Sheets)
export const sheetConfigs = pgTable('sheet_configs', {
  id: serial('id').primaryKey(),
  sheetUrl: text('sheet_url').notNull(), // google sheet url or ID
  active: boolean('active').default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. Comments & Star Ratings (Reviews) table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  spotId: integer('spot_id')
    .references(() => spots.id, { onDelete: 'cascade' })
    .notNull(),
  reviewerName: text('reviewer_name').notNull(),
  reviewerEmail: text('reviewer_email'),
  reviewerUid: text('reviewer_uid'),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations definitions
export const usersRelations = relations(users, ({}) => ({}));

export const spotsRelations = relations(spots, ({ many }) => ({
  deals: many(deals),
  menuItems: many(menuItems),
  reviews: many(reviews),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  spot: one(spots, {
    fields: [deals.spotId],
    references: [spots.id],
  }),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  spot: one(spots, {
    fields: [menuItems.spotId],
    references: [spots.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  spot: one(spots, {
    fields: [reviews.spotId],
    references: [spots.id],
  }),
}));
