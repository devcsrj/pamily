import dagre from '@dagrejs/dagre';
import { type Edge, type Node, Position } from '@xyflow/svelte';

export function getLayoutedElements(
	nodes: Node[],
	edges: Edge[],
	opts?: {
		nodeWidth?: number;
		nodeHeight?: number;
		direction?: 'TB' | 'LR';
	}
) {
	const nodeWidth = opts?.nodeWidth || 150;
	const nodeHeight = opts?.nodeHeight || 400;
	const direction = opts?.direction || 'TB';

	const isHorizontal = direction === 'LR';
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setGraph({});
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	for (const node of nodes) {
		dagreGraph.setNode(node.id, {
			width: nodeWidth,
			height: nodeHeight
		});
	}
	for (const edge of edges) {
		dagreGraph.setEdge(edge.source, edge.target);
	}

	dagre.layout(dagreGraph);

	for (const node of nodes) {
		const nodeWithPosition = dagreGraph.node(node.id);
		node.targetPosition = isHorizontal ? Position.Left : Position.Top;
		node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

		// We are shifting the dagre node position (anchor=center center) to the top left
		// so it matches the React Flow node anchor point (top left).
		node.position = {
			x: nodeWithPosition.x - nodeWidth / 2,
			y: nodeWithPosition.y - nodeHeight / 2
		};
	}

	return { nodes, edges };
}
