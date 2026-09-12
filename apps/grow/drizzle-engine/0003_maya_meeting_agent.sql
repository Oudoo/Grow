ALTER TABLE `meetings` ADD `meeting_url` text;--> statement-breakpoint
ALTER TABLE `meetings` ADD `bot_platform` varchar(32);--> statement-breakpoint
ALTER TABLE `meetings` ADD `bot_meeting_id` varchar(191);--> statement-breakpoint
ALTER TABLE `meetings` ADD `bot_status` varchar(64);--> statement-breakpoint
ALTER TABLE `meetings` ADD `bot_requested_at` timestamp;--> statement-breakpoint
ALTER TABLE `meetings` ADD `bot_ended_at` timestamp;--> statement-breakpoint
ALTER TABLE `meetings` ADD `live_notes` json DEFAULT ('[]') NOT NULL;--> statement-breakpoint
ALTER TABLE `meetings` ADD `minutes_markdown` text;--> statement-breakpoint
ALTER TABLE `meetings` ADD `summary` text;--> statement-breakpoint
ALTER TABLE `meetings` ADD `mentioned_documents` json DEFAULT ('[]') NOT NULL;--> statement-breakpoint
CREATE INDEX `meetings_bot_idx` ON `meetings` (`bot_platform`,`bot_meeting_id`);