ALTER TABLE `queue_jobs` ADD `payload` json DEFAULT ('{}') NOT NULL;--> statement-breakpoint
ALTER TABLE `queue_jobs` ADD `max_attempts` int DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `queue_jobs` ADD `available_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `queue_jobs` ADD `locked_at` timestamp;--> statement-breakpoint
ALTER TABLE `queue_jobs` ADD `locked_by` varchar(191);--> statement-breakpoint
CREATE INDEX `queue_jobs_poll_idx` ON `queue_jobs` (`status`,`available_at`);