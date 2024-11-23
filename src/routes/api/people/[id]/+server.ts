import { json, type RequestHandler } from '@sveltejs/kit';
import { personSchema } from '$lib/types/person';
import { getLineageService } from '$lib/server/service';

const updateForm = personSchema.omit({
	id: true
});

export const PUT: RequestHandler = async ({ params, request }) => {
	const id = params.id;
	if (!id) {
		return json({ message: 'Invalid request' }, { status: 400 });
	}

	const person = updateForm.parse(await request.json());
	const service = getLineageService();
	await service.updatePerson({
		...person,
		id
	});

	return json(person);
};
