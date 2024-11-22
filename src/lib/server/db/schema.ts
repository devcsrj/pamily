import { index, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const nodes = sqliteTable(
	'nodes',
	{
		id: text('id')
			.generatedAlwaysAs('(json_extract(data, "$.id"))', {
				mode: 'virtual'
			})
			.notNull()
			.unique(),
		body: text('data').notNull()
	},
	(table) => {
		return {
			idIndex: index('idx_id').on(table.id)
		};
	}
);

export const edges = sqliteTable(
	'edges',
	{
		source: text('source').references(() => nodes.id),
		target: text('target').references(() => nodes.id),
		properties: text('properties')
	},
	(table) => {
		return {
			// Note: missing ON CONFLICT REPLACE
			uniqueEdgeIndex: unique('idx_unique_edge').on(table.source, table.target, table.properties),
			sourceIndex: index('idx_source').on(table.source),
			targetIndex: index('idx_target').on(table.target)
		};
	}
);
