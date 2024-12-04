import type { FamilyId, Relationship } from '$lib/types/family';
import type { Person } from '$lib/types/person';

export interface LineageService {
	addPerson(familyId: FamilyId): Promise<Person>;
	addParent(childId: string, parentId: string): Promise<Relationship>;
	updatePerson(person: Person): Promise<void>;
	removePersonById(id: string): Promise<void>;
	getPersonById(id: string): Promise<Person | null>;
	getPeople(familyId: FamilyId): Promise<Person[]>;
	getRelationships(familyId: FamilyId): Promise<Relationship[]>;
}
