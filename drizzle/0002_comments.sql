CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_slug` text NOT NULL,
	`user_id` text,
	`parent_id` text,
	`body` text,
	`created_at` integer NOT NULL,
	`edited_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `comments_post_slug_idx` ON `comments` (`post_slug`);--> statement-breakpoint
CREATE INDEX `comments_parent_id_idx` ON `comments` (`parent_id`);--> statement-breakpoint
CREATE INDEX `comments_user_id_created_at_idx` ON `comments` (`user_id`,`created_at`);