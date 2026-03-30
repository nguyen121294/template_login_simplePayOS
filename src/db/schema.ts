import { pgTable as table, text, timestamp, boolean, doublePrecision, integer } from 'drizzle-orm/pg-core';

export const profiles = table('profiles', {
  id: text('id').primaryKey(), // Supabase user id
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  subscriptionId: text('subscription_id'),
  subscriptionStatus: text('subscription_status').default('inactive'), // active, inactive, past_due
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  status: text('status').default('active'), // active, locked
  createdAt: timestamp('created_at').defaultNow(),
});

export const payments = table('payments', {
  id: text('id').primaryKey(), // PayOS orderId
  userId: text('user_id').references(() => profiles.id),
  amount: doublePrecision('amount').notNull(),
  status: text('status').notNull(), // pending, paid, cancelled
  plan: text('plan').notNull().default('plus'), // free, plus, pro, premium
  createdAt: timestamp('created_at').defaultNow(),
});

export const plans = table('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: doublePrecision('price').notNull(),
  days: integer('days').notNull(),
  description: text('description'),
  features: text('features').array(), // Drizzle array type for postgres
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
