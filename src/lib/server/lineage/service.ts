import type { Db } from '$lib/server/db';
import { type FamilyId, type Relationship, relationshipSchema } from '$lib/types/family';
import { type Person, personSchema } from '$lib/types/person';
import type { LineageService } from './types';
import { eq, like, or, sql } from 'drizzle-orm';
import { edges, nodes } from '$lib/server/db/schema';
import placeholder = sql.placeholder;

export class SqliteLineageService implements LineageService {
	constructor(private readonly db: Db) {}

	async updatePerson(person: Person): Promise<void> {
		await this.db
			.update(nodes)
			.set({ body: JSON.stringify(person) })
			.where(eq(nodes.id, person.id))
			.execute();
	}

	async getPersonById(id: string): Promise<Person | null> {
		const statement = this.db
			.select()
			.from(nodes)
			.where(eq(nodes.id, placeholder('id')))
			.limit(1)
			.prepare();
		const result = statement.get({ id });
		if (!result) return null;
		return personSchema.parse(JSON.parse(result.body));
	}

	async getPeople(familyId: FamilyId): Promise<Person[]> {
		const statement = this.db
			.select()
			.from(nodes)
			.where(like(nodes.id, placeholder('id')))
			.prepare();
		const result = statement.all({ id: `${familyId}__%` });
		return result.map((n) => JSON.parse(n.body)).map((n) => personSchema.parse(n));
	}

	async getRelationships(familyId: FamilyId): Promise<Relationship[]> {
		const statement = this.db
			.select()
			.from(edges)
			.where(
				or(like(edges.source, placeholder('source')), like(edges.target, placeholder('target')))
			)
			.prepare();
		const result = statement.all({
			source: `${familyId}__%`,
			target: `${familyId}__%`
		});
		return result.map((r) => relationshipSchema.parse(r));
	}
}
