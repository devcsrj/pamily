import type { FamilyId, Relationship } from '$lib/types/family';
import type { Person } from '$lib/types/person';

export interface LineageService {
	getPeople(familyId: FamilyId): Promise<Person[]>;
	getRelationships(familyId: FamilyId): Promise<Relationship[]>;
}
