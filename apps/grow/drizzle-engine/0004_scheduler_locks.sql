CREATE TABLE `scheduler_locks` (
	`lock_key` varchar(191) NOT NULL,
	`owner` varchar(191) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduler_locks_lock_key` PRIMARY KEY(`lock_key`)
);
