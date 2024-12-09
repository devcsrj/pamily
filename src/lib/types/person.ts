import { z } from 'zod';

export const personSchema = z.object({
	id: z.string(),
	name: z.string(),
	avatarUrl: z.string().nullish(),
	dateOfBirth: z.string().date().nullish(),
	dateOfDeath: z.string().date().nullish(),
	socials: z
		.object({
			email: z.string().email().nullish(),
			twitter: z.string().nullish(),
			instagram: z.string().nullish(),
			facebook: z.string().nullish()
		})
		.nullish()
});

export type Person = z.infer<typeof personSchema>;
