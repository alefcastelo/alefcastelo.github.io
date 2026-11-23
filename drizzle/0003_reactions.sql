CREATE TABLE `reactions` (
	`post_slug` text NOT NULL,
	`user_id` text NOT NULL,
	`emoji` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`post_slug`, `user_id`, `emoji`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reactions_user_id_idx` ON `reactions` (`user_id`);