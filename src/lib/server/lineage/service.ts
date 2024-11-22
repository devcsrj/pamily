import type { Db } from '$lib/server/db';
import { type FamilyId, type Relationship, relationshipSchema } from '$lib/types/family';
import { type Person, personSchema } from '$lib/types/person';
import type { LineageService } from './types';
import { like, or, sql } from 'drizzle-orm';
import { edges, nodes } from '$lib/server/db/schema';
import placeholder = sql.placeholder;

export class SqliteLineageService implements LineageService {
	constructor(private readonly db: Db) {}

	async getPeople(familyId: FamilyId): Promise<Person[]> {
		const statement = this.db
			.select()
			.from(nodes)
			.where(like(nodes.id, placeholder('id')))
			.prepare();
		const result = statement.all({ id: `${familyId}/%` });
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
			source: `${familyId}/%`,
			target: `${familyId}/%`
		});
		return result.map((r) => relationshipSchema.parse(r));
	}
}
