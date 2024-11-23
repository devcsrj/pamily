import type { PageServerLoad } from './$types';
import { getLineageService } from '$lib/server/service';

export const ssr = false;

export const load: PageServerLoad = async ({ params }) => {
	const familyId = params.slug;
	const service = getLineageService();

	return {
		familyId,
		people: await service.getPeople(familyId),
		relationships: await service.getRelationships(familyId)
	};
};
