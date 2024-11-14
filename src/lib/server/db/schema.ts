import { pgTable, customType, date, integer, varchar, timestamp, serial } from 'drizzle-orm/pg-core';

const ltree = customType<{ data: string }>({
	dataType() {
		return 'ltree';
	}
});

export const person = pgTable('person', {
	id: serial('id').primaryKey(),
	firstName: varchar('first_name').notNull(),
	lastName: varchar('last_name').notNull(),
	dateOfBirth: date('date_of_birth').notNull(),
	dateOfDeath: date('date_of_death'),
	facebookId: varchar('facebook_id'),
	twitterId: varchar('twitter_id'),
	instagramId: varchar('instagram_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const family = pgTable('family', {
	id: serial('id').primaryKey(),
	slug: varchar('slug').notNull(),
	name: varchar('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const familyTree = pgTable('family_tree', {
	id: serial('id').primaryKey(),
	familyId: integer('family_id')
		.notNull()
		.references(() => family.id, { onDelete: 'cascade' }),
	personId: integer('person_id').notNull(),
	path: ltree('path').notNull().unique()
});
