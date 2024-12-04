import type { Db } from '$lib/server/db';
import { type FamilyId, type Relationship, relationshipSchema } from '$lib/types/family';
import { type Person, personSchema } from '$lib/types/person';
import type { LineageService } from './types';
import { and, eq, inArray, like, or, sql } from 'drizzle-orm';
import { edges, nodes } from '$lib/server/db/schema';
import placeholder = sql.placeholder;
import { uid } from 'uid';

export class SqliteLineageService implements LineageService {
	constructor(private readonly db: Db) {}

	async addPerson(familyId: FamilyId): Promise<Person> {
		const id = `${familyId}__${uid()}`;
		const person: Person = {
			id,
			name: 'Person'
		};
		const inserted = await this.db
			.insert(nodes)
			.values({
				id,
				body: JSON.stringify(person)
			})
			.returning()
			.execute();
		return personSchema.parse(JSON.parse(inserted[0].body));
	}

	async addParent(childId: string, parentId: string): Promise<Relationship> {
		return this.db.transaction(async (tx) => {
			const people = await tx
				.select()
				.from(nodes)
				.where(inArray(nodes.id, [childId, parentId]))
				.limit(2)
				.execute();
			if (people.length !== 2) {
				throw new Error(`Person not found: ${childId} or ${parentId}`);
			}

			const relationship = await tx
				.select()
				.from(edges)
				.where(
					or(
						and(eq(edges.source, childId), eq(edges.target, parentId)),
						and(eq(edges.source, parentId), eq(edges.target, childId))
					)
				)
				.limit(2)
				.execute();
			if (relationship.length > 0) {
				return {
					source: parentId,
					target: childId
				};
			}

			await tx
				.insert(edges)
				.values([{ source: parentId, target: childId }])
				.execute();

			return {
				source: parentId,
				target: childId
			};
		});
	}

	async updatePerson(person: Person): Promise<void> {
		const result = await this.db
			.update(nodes)
			.set({ body: JSON.stringify(person) })
			.where(eq(nodes.id, person.id))
			.execute();
		if (result.changes === 0) {
			throw new Error(`Person not found: ${person.id}`);
		}
	}

	async removePersonById(id: string): Promise<void> {
		return this.db.transaction(async (tx) => {
			await tx
				.delete(edges)
				.where(or(eq(edges.source, id), eq(edges.target, id)))
				.execute();
			await tx.delete(nodes).where(eq(nodes.id, id)).execute();
		});
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
