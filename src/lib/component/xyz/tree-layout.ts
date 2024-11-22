import { type Edge, type Node } from '@xyflow/svelte';

export class TreeLayout {
	private readonly nodeWidth: number;
	private readonly nodeHeight: number;
	private readonly minSpacing: number;

	constructor(opts: { nodeWidth: number; nodeHeight: number; minSpacing: number }) {
		this.nodeWidth = opts.nodeWidth;
		this.nodeHeight = opts.nodeHeight;
		this.minSpacing = opts.minSpacing;
	}

	layout(nodes: Node[], edges: Edge[]) {
		// Create relationship maps
		const relationships = this.inferRelationships(nodes, edges);
		const { spouses, parentToChildren, childToParents, siblings } = relationships;

		// Step 1: Find root nodes (ancestors with no parents)
		const rootNodes = nodes.filter((node) => !childToParents.has(node.id));

		// Step 2: Assign levels through BFS
		const levels = new Map<number, Node[]>();
		const nodeLevels = new Map<string, number>();
		const queue = rootNodes.map((node) => ({ node, level: 0 }));
		const processed = new Set<string>();

		let maxLevel = 0; // Track deepest level for the height calculation

		while (queue.length > 0) {
			const { node, level } = queue.shift()!;
			if (processed.has(node.id)) continue;

			processed.add(node.id);
			if (!levels.has(level)) levels.set(level, []);

			levels.get(level)?.push(node);
			nodeLevels.set(node.id, level);
			maxLevel = Math.max(maxLevel, level);

			// Process spouse at the same level
			const nodeSpouses = spouses.get(node.id) || new Set();
			nodeSpouses.forEach((spouseId) => {
				const spouse = nodes.find((n) => n.id === spouseId);
				if (spouse && !processed.has(spouseId)) {
					levels.get(level)?.push(spouse);
					nodeLevels.set(spouseId, level);
					processed.add(spouseId);
				}
			});

			// Process siblings at the same level
			const nodeSiblings = siblings.get(node.id) || new Set();
			nodeSiblings.forEach((siblingId) => {
				const sibling = nodes.find((n) => n.id === siblingId);
				if (sibling && !processed.has(siblingId)) {
					levels.get(level)?.push(sibling);
					nodeLevels.set(siblingId, level);
					processed.add(siblingId);
				}
			});

			// Add children to queue
			const children = parentToChildren.get(node.id) || new Set();
			children.forEach((childId) => {
				const childNode = nodes.find((n) => n.id === childId);
				if (childNode && !processed.has(childId)) {
					queue.push({ node: childNode, level: level + 1 });
				}
			});
		}

		// Step 3: Calculate required dimensions
		let maxNodesInLevel = 0;
		let maxGroupsInLevel = 0;

		levels.forEach((nodesInLevel, level) => {
			const groupedNodes = this.groupRelatedNodes(nodesInLevel, spouses);
			maxNodesInLevel = Math.max(maxNodesInLevel, nodesInLevel.length);
			maxGroupsInLevel = Math.max(maxGroupsInLevel, groupedNodes.length);
		});

		// Calculate minimum width needed
		const minWidth = Math.max(
			// Width based on max nodes in a level
			maxNodesInLevel * (this.nodeWidth + this.minSpacing),
			// Width based on max groups in a level
			maxGroupsInLevel * (this.nodeWidth + this.minSpacing)
		);

		// Calculate minimum height needed
		const minHeight = (maxLevel + 1) * this.nodeHeight;

		// Step 4: Position nodes using calculated dimensions
		levels.forEach((nodesInLevel, level) => {
			const groupedNodes = this.groupRelatedNodes(nodesInLevel, spouses);
			const groupSpacing = minWidth / (groupedNodes.length + 1);

			groupedNodes.forEach((group, groupIndex) => {
				const groupWidth = group.length * this.nodeWidth;
				const groupStart = groupSpacing * (groupIndex + 1) - groupWidth / 2;

				group.forEach((node, nodeIndex) => {
					node.position.x = groupStart + nodeIndex * this.nodeWidth;
					node.position.y = this.nodeHeight * level;
				});
			});
		});
	}

	private inferRelationships(nodes: Node[], edges: Edge[]) {
		const parentToChildren = new Map<string, Set<string>>();
		const childToParents = new Map<string, Set<string>>();
		const spouses = new Map<string, Set<string>>();
		const siblings = new Map<string, Set<string>>();

		// Step 1: Build parent-child relationships
		edges.forEach((edge) => {
			const { source: parentId, target: childId } = edge;

			if (!parentToChildren.has(parentId)) {
				parentToChildren.set(parentId, new Set());
			}
			if (!childToParents.has(childId)) {
				childToParents.set(childId, new Set());
			}

			parentToChildren.get(parentId)?.add(childId);
			childToParents.get(childId)?.add(parentId);
		});

		// Step 2: Infer spouses (parents who share children)
		nodes.forEach((node) => {
			const children = parentToChildren.get(node.id);
			if (!children) return;

			children.forEach((childId) => {
				const childParents = childToParents.get(childId);
				if (childParents && childParents.size > 1) {
					// Other parents of this child are potential spouses
					childParents.forEach((parentId) => {
						if (parentId !== node.id) {
							if (!spouses.has(node.id)) spouses.set(node.id, new Set());
							if (!spouses.has(parentId)) spouses.set(parentId, new Set());
							spouses.get(node.id)?.add(parentId);
							spouses.get(parentId)?.add(node.id);
						}
					});
				}
			});
		});

		// Step 3: Infer siblings (children who share parents)
		nodes.forEach((node) => {
			const parents = childToParents.get(node.id);
			if (!parents) return;

			parents.forEach((parentId) => {
				const parentChildren = parentToChildren.get(parentId);
				if (parentChildren) {
					parentChildren.forEach((siblingId) => {
						if (siblingId !== node.id) {
							if (!siblings.has(node.id)) siblings.set(node.id, new Set());
							if (!siblings.has(siblingId)) siblings.set(siblingId, new Set());
							siblings.get(node.id)?.add(siblingId);
							siblings.get(siblingId)?.add(node.id);
						}
					});
				}
			});
		});

		return { spouses, parentToChildren, childToParents, siblings };
	}

	private groupRelatedNodes(nodes: Node[], spouses: Map<string, Set<string>>) {
		const groups: Node[][] = [];
		const processed = new Set();

		nodes.forEach((node) => {
			if (processed.has(node.id)) return;

			const group = [node];
			processed.add(node.id);

			// Add spouses to the same group
			const nodeSpouses = spouses.get(node.id) || new Set();
			nodeSpouses.forEach((spouseId) => {
				if (!processed.has(spouseId)) {
					const spouse = nodes.find((n) => n.id === spouseId);
					if (spouse) {
						group.push(spouse);
						processed.add(spouseId);
					}
				}
			});

			groups.push(group);
		});

		return groups;
	}
}
