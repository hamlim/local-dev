CREATE TABLE `local_domains` (
	`id` integer PRIMARY KEY NOT NULL,
	`domain` text NOT NULL,
	`port` integer NOT NULL,
	`note` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `local_domains_domain_unique` ON `local_domains` (`domain`);--> statement-breakpoint
CREATE UNIQUE INDEX `local_domains_port_unique` ON `local_domains` (`port`);