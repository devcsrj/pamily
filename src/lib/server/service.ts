import type { LineageService } from '$lib/server/lineage/types';
import { SqliteLineageService } from '$lib/server/lineage/service';
import { db } from '$lib/server/db';

export function getLineageService(): LineageService {
	return new SqliteLineageService(db);
}
