import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { familyIdSchema } from '$lib/types/family';
import { getLineageService } from '$lib/server/service';

const newForm = z.object({
	familyId: familyIdSchema
});

export const POST: RequestHandler = async ({ request }) => {
	const { familyId } = newForm.parse(await request.json());
	const service = getLineageService();
	const person = await service.addPerson(familyId);
	return json(person);
};
