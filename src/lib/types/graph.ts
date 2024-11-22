export type NodeId = string;

export type Node<T> = {
	id: NodeId;
	value: T;
};

export type Edge<P> = {
	from: NodeId;
	to: NodeId;
	properties?: P;
};
