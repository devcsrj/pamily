import { json, type RequestHandler } from '@sveltejs/kit';
import { getLineageService } from '$lib/server/service';

export const PUT: RequestHandler = async ({ params }) => {
	const { id, pid } = params;

	const service = getLineageService();
	const relationship = await service.addParent(id!, pid!);

	return json(relationship);
};
