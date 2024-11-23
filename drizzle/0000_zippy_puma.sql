CREATE TABLE `edges` (
	`source` text NOT NULL,
	`target` text NOT NULL,
	`properties` text,
	FOREIGN KEY (`source`) REFERENCES `nodes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target`) REFERENCES `nodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nodes` (
	`id` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_source` ON `edges` (`source`);--> statement-breakpoint
CREATE INDEX `idx_target` ON `edges` (`target`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_unique_edge` ON `edges` (`source`,`target`,`properties`);--> statement-breakpoint
CREATE UNIQUE INDEX `nodes_id_unique` ON `nodes` (`id`);--> statement-breakpoint
CREATE INDEX `idx_id` ON `nodes` (`id`);