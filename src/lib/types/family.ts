import { z } from 'zod';

export const familyIdSchema = z.string();

export type FamilyId = z.infer<typeof familyIdSchema>;

export const familySchema = z.object({
	id: familyIdSchema,
	name: z.string()
});

export type Family = z.infer<typeof familySchema>;

export const relationshipSchema = z.object({
	source: z.string(),
	target: z.string()
});

export type Relationship = z.infer<typeof relationshipSchema>;
