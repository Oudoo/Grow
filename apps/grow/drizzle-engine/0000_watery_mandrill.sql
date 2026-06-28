CREATE TABLE `api_keys` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`key_hash` varchar(191) NOT NULL,
	`key_prefix` varchar(191) NOT NULL,
	`scopes` json NOT NULL DEFAULT ('[]'),
	`last_used_at` timestamp,
	`expires_at` timestamp,
	`revoked_at` timestamp,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_hash_idx` UNIQUE(`key_hash`)
);
--> statement-breakpoint
CREATE TABLE `data_retention_policies` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`data_category` varchar(191) NOT NULL,
	`retention_days` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`last_enforced_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `data_retention_policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `retention_tenant_category_idx` UNIQUE(`tenant_id`,`data_category`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(36) NOT NULL,
	`key` varchar(191) NOT NULL,
	`description` text,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_key_idx` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text,
	`is_system` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_tenant_name_idx` UNIQUE(`tenant_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `tenant_invites` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`email` varchar(191) NOT NULL,
	`role_id` varchar(36),
	`client_id` varchar(36),
	`token` varchar(191) NOT NULL,
	`invited_by` varchar(36),
	`expires_at` timestamp NOT NULL,
	`accepted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_invites_token_idx` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'active',
	`settings` json NOT NULL DEFAULT ('{}'),
	`branding` json NOT NULL DEFAULT ('{}'),
	`timezone` varchar(191) NOT NULL DEFAULT 'UTC',
	`currency` varchar(191) NOT NULL DEFAULT 'USD',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	CONSTRAINT `user_roles_user_id_role_id_pk` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`email` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`password_hash` text,
	`avatar_url` text,
	`status` varchar(64) NOT NULL DEFAULT 'active',
	`is_super_admin` boolean NOT NULL DEFAULT false,
	`client_id` varchar(36),
	`last_login_at` timestamp,
	`preferences` json NOT NULL DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_tenant_email_idx` UNIQUE(`tenant_id`,`email`)
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`feature_id` varchar(36) NOT NULL,
	`enabled` boolean NOT NULL,
	`config` json NOT NULL DEFAULT ('{}'),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feature_flags_id` PRIMARY KEY(`id`),
	CONSTRAINT `feature_flags_tenant_feature_idx` UNIQUE(`tenant_id`,`feature_id`)
);
--> statement-breakpoint
CREATE TABLE `features` (
	`id` varchar(36) NOT NULL,
	`key` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text,
	`default_enabled` boolean NOT NULL DEFAULT true,
	`is_beta` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `features_id` PRIMARY KEY(`id`),
	CONSTRAINT `features_key_idx` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`industry` varchar(191),
	`website_url` text,
	`status` varchar(64) NOT NULL DEFAULT 'active',
	`account_manager_id` varchar(36),
	`monthly_retainer` decimal(12,2),
	`milestone_targets` json NOT NULL DEFAULT ('[]'),
	`settings` json NOT NULL DEFAULT ('{}'),
	`onboarded_at` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_tenant_slug_idx` UNIQUE(`tenant_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text,
	`status` varchar(64) NOT NULL DEFAULT 'active',
	`owner_id` varchar(36),
	`budget` decimal(12,2),
	`start_date` date,
	`end_date` date,
	`metadata` json NOT NULL DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_cache` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`cache_key` varchar(191) NOT NULL,
	`payload` json NOT NULL,
	`source_trace` json NOT NULL DEFAULT ('{}'),
	`computed_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp,
	CONSTRAINT `analytics_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_cache_key_idx` UNIQUE(`tenant_id`,`cache_key`)
);
--> statement-breakpoint
CREATE TABLE `api_quota_usage` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`provider` varchar(64) NOT NULL,
	`window_start` timestamp NOT NULL,
	`request_count` int NOT NULL DEFAULT 0,
	`throttled_count` int NOT NULL DEFAULT 0,
	`quota_limit` int,
	`backoff_until` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_quota_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_quota_window_idx` UNIQUE(`tenant_id`,`provider`,`window_start`)
);
--> statement-breakpoint
CREATE TABLE `integration_kill_switches` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`provider` varchar(64) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`reason` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integration_kill_switches_id` PRIMARY KEY(`id`),
	CONSTRAINT `kill_switch_idx` UNIQUE(`tenant_id`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `integration_logs` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`integration_id` varchar(36) NOT NULL,
	`status` varchar(64) NOT NULL,
	`operation` varchar(191) NOT NULL,
	`api_request_ids` json NOT NULL DEFAULT ('[]'),
	`records_fetched` int NOT NULL DEFAULT 0,
	`records_stored` int NOT NULL DEFAULT 0,
	`sanity_findings` json NOT NULL DEFAULT ('[]'),
	`error` text,
	`duration_ms` int,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`finished_at` timestamp,
	CONSTRAINT `integration_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`provider` varchar(64) NOT NULL,
	`name` varchar(191) NOT NULL,
	`external_account_id` text,
	`encrypted_credentials` text,
	`status` varchar(64) NOT NULL DEFAULT 'disconnected',
	`token_expires_at` timestamp,
	`last_sync_at` timestamp,
	`last_successful_sync_at` timestamp,
	`last_error` text,
	`consecutive_failures` int NOT NULL DEFAULT 0,
	`sync_frequency_minutes` int NOT NULL DEFAULT 360,
	`config` json NOT NULL DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metric_records` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`integration_id` varchar(36) NOT NULL,
	`provider` varchar(64) NOT NULL,
	`metric` varchar(191) NOT NULL,
	`dimensions` json NOT NULL DEFAULT ('{}'),
	`date` date NOT NULL,
	`value` decimal(18,4) NOT NULL,
	`currency` varchar(191),
	`source_request_id` text,
	`source_reference_url` text,
	`sanity_status` varchar(191) NOT NULL DEFAULT 'passed',
	`sanity_notes` json NOT NULL DEFAULT ('[]'),
	`fetched_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metric_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `metric_records_unique_fact_idx` UNIQUE(`integration_id`,`metric`,`date`,`dimensions`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`entity_type` varchar(191) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`author_id` varchar(36),
	`body` text NOT NULL,
	`is_internal` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sprint_showcases` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`video_storage_key` text,
	`video_duration_seconds` int,
	`sprint_start` date,
	`sprint_end` date,
	`highlights` json NOT NULL DEFAULT ('[]'),
	`published_at` timestamp,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sprint_showcases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sub_tasks` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`task_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'todo',
	`assignee_id` varchar(36),
	`completed_at` timestamp,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sub_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`project_id` varchar(36),
	`dmaic_project_id` varchar(36),
	`dmaic_phase` varchar(191),
	`title` text NOT NULL,
	`description` text,
	`status` varchar(64) NOT NULL DEFAULT 'todo',
	`priority` varchar(64) NOT NULL DEFAULT 'medium',
	`assignee_id` varchar(36),
	`estimate_hours` decimal(7,2),
	`due_date` date,
	`started_at` timestamp,
	`completed_at` timestamp,
	`rework_count` int NOT NULL DEFAULT 0,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_scorecards` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`tasks_completed` int NOT NULL DEFAULT 0,
	`tasks_on_time` int NOT NULL DEFAULT 0,
	`avg_cycle_time_hours` decimal(10,2),
	`sla_compliance_pct` decimal(5,2),
	`rework_rate_pct` decimal(5,2),
	`tickets_resolved` int NOT NULL DEFAULT 0,
	`avg_first_response_minutes` decimal(10,2),
	`computed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_scorecards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`project_id` varchar(36),
	`number` int NOT NULL,
	`subject` text NOT NULL,
	`description` text,
	`status` varchar(64) NOT NULL DEFAULT 'open',
	`priority` varchar(64) NOT NULL DEFAULT 'medium',
	`requester_id` varchar(36),
	`assignee_id` varchar(36),
	`sla_due_at` timestamp,
	`first_response_at` timestamp,
	`resolved_at` timestamp,
	`tags` json NOT NULL DEFAULT ('[]'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`agenda` text,
	`status` varchar(64) NOT NULL DEFAULT 'scheduled',
	`scheduled_at` timestamp,
	`duration_minutes` int,
	`attendees` json NOT NULL DEFAULT ('[]'),
	`prerequisite_form_id` varchar(36),
	`prerequisite_responses` json NOT NULL DEFAULT ('{}'),
	`recording_storage_key` text,
	`recording_mime_type` text,
	`organizer_id` varchar(36),
	`extracted_requirements` json NOT NULL DEFAULT ('[]'),
	`extracted_challenges` json NOT NULL DEFAULT ('[]'),
	`action_items` json NOT NULL DEFAULT ('[]'),
	`expectation_baseline` text,
	`analysis_confidence` decimal(5,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meetings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prerequisite_forms` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`name` varchar(191) NOT NULL,
	`fields` json NOT NULL DEFAULT ('[]'),
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prerequisite_forms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sow_documents` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`meeting_id` varchar(36),
	`title` text NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'draft',
	`scope_items` json NOT NULL DEFAULT ('[]'),
	`technical_feasibility` json NOT NULL DEFAULT ('{}'),
	`man_day_estimates` json NOT NULL DEFAULT ('{}'),
	`option_tiers` json NOT NULL DEFAULT ('[]'),
	`document_markdown` text,
	`generation_confidence` decimal(5,2),
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sow_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transcripts` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`meeting_id` varchar(36) NOT NULL,
	`engine` varchar(64) NOT NULL,
	`language` varchar(191),
	`full_text` text NOT NULL,
	`segments` json NOT NULL DEFAULT ('[]'),
	`word_count` int,
	`processing_time_ms` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transcripts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aom_embeddings` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`entity_type` varchar(191) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`chunk_index` int NOT NULL DEFAULT 0,
	`chunk_text` text NOT NULL,
	`embedding` json,
	`embedding_model` varchar(191) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aom_embeddings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aom_links` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`from_entity_type` varchar(191) NOT NULL,
	`from_entity_id` varchar(36) NOT NULL,
	`to_entity_type` varchar(191) NOT NULL,
	`to_entity_id` varchar(36) NOT NULL,
	`link_type` varchar(191) NOT NULL DEFAULT 'references',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aom_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `change_requests` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'submitted',
	`requested_by_name` text,
	`requested_by_user_id` varchar(36),
	`impact_assessment` json NOT NULL DEFAULT ('{}'),
	`estimated_man_days` decimal(7,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `change_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`title` text NOT NULL,
	`outcome` varchar(64) NOT NULL,
	`reason` text,
	`approved_by_name` text,
	`approved_by_user_id` varchar(36),
	`source_entity_type` varchar(191),
	`source_entity_id` varchar(36),
	`context` json NOT NULL DEFAULT ('{}'),
	`decided_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_documents` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`type` varchar(64) NOT NULL DEFAULT 'note',
	`title` text NOT NULL,
	`content_markdown` text NOT NULL,
	`storage_key` text,
	`source_entity_type` varchar(191),
	`source_entity_id` varchar(36),
	`tags` json NOT NULL DEFAULT ('[]'),
	`author_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledge_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`category` varchar(191) NOT NULL DEFAULT 'marketing',
	`status` varchar(64) NOT NULL DEFAULT 'proposed',
	`evidence` json NOT NULL DEFAULT ('[]'),
	`evidence_count` int NOT NULL DEFAULT 0,
	`confidence_score` decimal(5,2),
	`data_sources` json NOT NULL DEFAULT ('[]'),
	`expected_impact` json NOT NULL DEFAULT ('{}'),
	`measured_impact` json NOT NULL DEFAULT ('{}'),
	`proposed_by` varchar(36),
	`ai_generated` int NOT NULL DEFAULT 0,
	`presented_at` timestamp,
	`decided_at` timestamp,
	`implemented_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aeo_audits` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`target_url` text NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'queued',
	`pages_crawled` int NOT NULL DEFAULT 0,
	`overall_score` decimal(5,2),
	`dimension_scores` json NOT NULL DEFAULT ('{}'),
	`page_findings` json NOT NULL DEFAULT ('[]'),
	`recommendations` json NOT NULL DEFAULT ('[]'),
	`confidence_score` decimal(5,2),
	`error` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `aeo_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dmaic_projects` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`problem_statement` text NOT NULL,
	`current_phase` varchar(64) NOT NULL DEFAULT 'define',
	`phases` json NOT NULL DEFAULT ('{}'),
	`timeline` json NOT NULL DEFAULT ('[]'),
	`confidence_score` decimal(5,2),
	`data_sources` json NOT NULL DEFAULT ('[]'),
	`evidence_count` int NOT NULL DEFAULT 0,
	`owner_id` varchar(36),
	`ai_generated` int NOT NULL DEFAULT 1,
	`source_finding_type` text,
	`source_finding_id` varchar(36),
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dmaic_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forecasts` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`metric` varchar(191) NOT NULL,
	`horizon_days` int NOT NULL DEFAULT 30,
	`status` varchar(64) NOT NULL DEFAULT 'queued',
	`points` json NOT NULL DEFAULT ('[]'),
	`method` varchar(191) NOT NULL DEFAULT 'holt_winters',
	`confidence_score` decimal(5,2),
	`data_sources` json NOT NULL DEFAULT ('[]'),
	`evidence_count` int NOT NULL DEFAULT 0,
	`training_window` json NOT NULL DEFAULT ('{}'),
	`backtest_mape` decimal(7,3),
	`narrative` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `forecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_scores` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`score` decimal(5,2) NOT NULL,
	`components` json NOT NULL DEFAULT ('{}'),
	`trend` varchar(191) NOT NULL DEFAULT 'stable',
	`drivers` json NOT NULL DEFAULT ('[]'),
	`computed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_audits` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`company_name` text NOT NULL,
	`contact_name` text NOT NULL,
	`contact_email` text NOT NULL,
	`website_url` text NOT NULL,
	`industry` varchar(191),
	`monthly_ad_budget` text,
	`primary_goal` text,
	`responses` json NOT NULL DEFAULT ('{}'),
	`status` varchar(64) NOT NULL DEFAULT 'submitted',
	`audit_report` text,
	`audit_score` decimal(5,2),
	`audit_findings` json NOT NULL DEFAULT ('[]'),
	`utm_source` text,
	`error` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `lead_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lost_opportunities` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`metric` varchar(191) NOT NULL,
	`missed_value_low` decimal(18,2) NOT NULL,
	`missed_value_high` decimal(18,2) NOT NULL,
	`currency` varchar(191) NOT NULL DEFAULT 'USD',
	`methodology` text NOT NULL,
	`confidence_score` decimal(5,2),
	`data_sources` json NOT NULL DEFAULT ('[]'),
	`evidence_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lost_opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `process_insights` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`insight_type` varchar(191) NOT NULL,
	`title` text NOT NULL,
	`finding` text NOT NULL,
	`recommended_action` text NOT NULL,
	`evidence` json NOT NULL DEFAULT ('{}'),
	`evidence_count` int NOT NULL DEFAULT 0,
	`confidence_score` decimal(5,2),
	`data_sources` json NOT NULL DEFAULT ('[]'),
	`severity` varchar(191) NOT NULL DEFAULT 'medium',
	`status` varchar(191) NOT NULL DEFAULT 'open',
	`computed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `process_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seasonality_patterns` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`metric` varchar(191) NOT NULL,
	`heatmap` json NOT NULL DEFAULT ('[]'),
	`budget_scaling_map` json NOT NULL DEFAULT ('[]'),
	`years_of_data` decimal(4,1),
	`confidence_score` decimal(5,2),
	`computed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seasonality_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ab_pilots` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`creative_asset_id` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'scheduled',
	`platform` varchar(191) NOT NULL,
	`external_campaign_id` text,
	`daily_budget` decimal(12,2) NOT NULL,
	`currency` varchar(191) NOT NULL DEFAULT 'USD',
	`start_date` date,
	`end_date` date,
	`results` json NOT NULL DEFAULT ('[]'),
	`verdict` json NOT NULL DEFAULT ('{}'),
	`confidence_score` decimal(5,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ab_pilots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cat_approvals` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`creative_asset_id` varchar(36) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'pending',
	`requested_by` varchar(36),
	`decided_by_user_id` varchar(36),
	`decided_by_name` text,
	`decision_note` text,
	`checklist` json NOT NULL DEFAULT ('[]'),
	`requested_at` timestamp NOT NULL DEFAULT (now()),
	`decided_at` timestamp,
	`expires_at` timestamp,
	CONSTRAINT `cat_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creative_assets` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`project_id` varchar(36),
	`name` varchar(191) NOT NULL,
	`asset_type` varchar(191) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'draft',
	`storage_key` text,
	`preview_url` text,
	`copy_text` text,
	`platforms` json NOT NULL DEFAULT ('[]'),
	`metadata` json NOT NULL DEFAULT ('{}'),
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creative_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cost_tracking` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`project_id` varchar(36),
	`provider` varchar(191) NOT NULL,
	`model` varchar(191) NOT NULL,
	`feature` text NOT NULL,
	`input_tokens` int NOT NULL DEFAULT 0,
	`output_tokens` int NOT NULL DEFAULT 0,
	`cost_usd` decimal(12,6) NOT NULL DEFAULT '0',
	`ai_job_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cost_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`subscription_id` varchar(36),
	`number` varchar(191) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'draft',
	`line_items` json NOT NULL DEFAULT ('[]'),
	`subtotal` decimal(14,2) NOT NULL DEFAULT '0',
	`tax` decimal(14,2) NOT NULL DEFAULT '0',
	`total` decimal(14,2) NOT NULL DEFAULT '0',
	`currency` varchar(191) NOT NULL DEFAULT 'USD',
	`issued_at` timestamp,
	`due_at` timestamp,
	`paid_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_tenant_number_idx` UNIQUE(`tenant_id`,`number`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` varchar(36) NOT NULL,
	`key` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text,
	`monthly_price` decimal(12,2) NOT NULL,
	`currency` varchar(191) NOT NULL DEFAULT 'USD',
	`limits` json NOT NULL DEFAULT ('{}'),
	`features` json NOT NULL DEFAULT ('[]'),
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `plans_key_idx` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`plan_id` varchar(36) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'active',
	`current_period_start` date NOT NULL,
	`current_period_end` date NOT NULL,
	`cancel_at_period_end` int NOT NULL DEFAULT 0,
	`external_refs` json NOT NULL DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usage_records` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`meter` varchar(191) NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`usage_date` date NOT NULL,
	`metadata` json NOT NULL DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usage_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_jobs` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`job_type` varchar(191) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'queued',
	`input` json NOT NULL DEFAULT ('{}'),
	`output` json NOT NULL DEFAULT ('{}'),
	`queue_job_id` varchar(191),
	`error` text,
	`attempts` int NOT NULL DEFAULT 0,
	`started_at` timestamp,
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`actor_id` varchar(36),
	`actor_type` varchar(191) NOT NULL DEFAULT 'user',
	`action` varchar(191) NOT NULL,
	`entity_type` varchar(191),
	`entity_id` varchar(36),
	`changes` json NOT NULL DEFAULT ('{}'),
	`ip_address` text,
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backup_records` (
	`id` varchar(36) NOT NULL,
	`backup_type` varchar(191) NOT NULL,
	`storage_key` text,
	`size_bytes` text,
	`status` varchar(191) NOT NULL DEFAULT 'running',
	`error` text,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`expires_at` timestamp,
	CONSTRAINT `backup_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `domain_events` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`event_type` varchar(191) NOT NULL,
	`payload` json NOT NULL DEFAULT ('{}'),
	`entity_type` varchar(191),
	`entity_id` varchar(36),
	`dispatch_status` varchar(191) NOT NULL DEFAULT 'pending',
	`handler_results` json NOT NULL DEFAULT ('[]'),
	`occurred_at` timestamp NOT NULL DEFAULT (now()),
	`dispatched_at` timestamp,
	CONSTRAINT `domain_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feature_requests` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`title` text NOT NULL,
	`description` text,
	`status` varchar(191) NOT NULL DEFAULT 'open',
	`submitted_by` varchar(36),
	`vote_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feature_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_rules` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`event_type` varchar(191) NOT NULL,
	`template_key` varchar(191) NOT NULL,
	`channels` json NOT NULL DEFAULT ('["in_app"]'),
	`audience` json NOT NULL DEFAULT ('{}'),
	`conditions` json NOT NULL DEFAULT ('{}'),
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_templates` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`key` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`subject_template` text NOT NULL,
	`body_template` text NOT NULL,
	`channels` json NOT NULL DEFAULT ('["in_app"]'),
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `notif_templates_tenant_key_idx` UNIQUE(`tenant_id`,`key`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`channel` varchar(64) NOT NULL DEFAULT 'in_app',
	`template_key` varchar(191),
	`title` text NOT NULL,
	`body` text,
	`link_url` text,
	`status` varchar(191) NOT NULL DEFAULT 'queued',
	`error` text,
	`metadata` json NOT NULL DEFAULT ('{}'),
	`read_at` timestamp,
	`sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `queue_jobs` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36),
	`queue_name` varchar(191) NOT NULL,
	`job_name` varchar(191) NOT NULL,
	`bull_job_id` varchar(191) NOT NULL,
	`status` varchar(191) NOT NULL DEFAULT 'waiting',
	`payload_summary` json NOT NULL DEFAULT ('{}'),
	`error` text,
	`attempts` int NOT NULL DEFAULT 0,
	`duration_ms` int,
	`enqueued_at` timestamp NOT NULL DEFAULT (now()),
	`finished_at` timestamp,
	CONSTRAINT `queue_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`feature_request_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`),
	CONSTRAINT `votes_unique_idx` UNIQUE(`feature_request_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_deliveries` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`endpoint_id` varchar(36) NOT NULL,
	`event_type` varchar(191) NOT NULL,
	`payload` json NOT NULL DEFAULT ('{}'),
	`response_status` int,
	`status` varchar(191) NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`delivered_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_endpoints` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`url` text NOT NULL,
	`event_types` json NOT NULL DEFAULT ('[]'),
	`encrypted_secret` text,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_endpoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `data_retention_policies` ADD CONSTRAINT `data_retention_policies_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `roles_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_invites` ADD CONSTRAINT `tenant_invites_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_invites` ADD CONSTRAINT `tenant_invites_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_invites` ADD CONSTRAINT `tenant_invites_invited_by_users_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feature_flags` ADD CONSTRAINT `feature_flags_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feature_flags` ADD CONSTRAINT `feature_flags_feature_id_features_id_fk` FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_account_manager_id_users_id_fk` FOREIGN KEY (`account_manager_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_cache` ADD CONSTRAINT `analytics_cache_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_cache` ADD CONSTRAINT `analytics_cache_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_quota_usage` ADD CONSTRAINT `api_quota_usage_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integration_kill_switches` ADD CONSTRAINT `integration_kill_switches_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integration_logs` ADD CONSTRAINT `integration_logs_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integration_logs` ADD CONSTRAINT `integration_logs_integration_id_integrations_id_fk` FOREIGN KEY (`integration_id`) REFERENCES `integrations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integrations` ADD CONSTRAINT `integrations_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integrations` ADD CONSTRAINT `integrations_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `metric_records` ADD CONSTRAINT `metric_records_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `metric_records` ADD CONSTRAINT `metric_records_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `metric_records` ADD CONSTRAINT `metric_records_integration_id_integrations_id_fk` FOREIGN KEY (`integration_id`) REFERENCES `integrations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sprint_showcases` ADD CONSTRAINT `sprint_showcases_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sprint_showcases` ADD CONSTRAINT `sprint_showcases_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sprint_showcases` ADD CONSTRAINT `sprint_showcases_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sub_tasks` ADD CONSTRAINT `sub_tasks_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sub_tasks` ADD CONSTRAINT `sub_tasks_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sub_tasks` ADD CONSTRAINT `sub_tasks_assignee_id_users_id_fk` FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assignee_id_users_id_fk` FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_scorecards` ADD CONSTRAINT `team_scorecards_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_scorecards` ADD CONSTRAINT `team_scorecards_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_requester_id_users_id_fk` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_assignee_id_users_id_fk` FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_prerequisite_form_id_prerequisite_forms_id_fk` FOREIGN KEY (`prerequisite_form_id`) REFERENCES `prerequisite_forms`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_organizer_id_users_id_fk` FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prerequisite_forms` ADD CONSTRAINT `prerequisite_forms_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prerequisite_forms` ADD CONSTRAINT `prerequisite_forms_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sow_documents` ADD CONSTRAINT `sow_documents_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sow_documents` ADD CONSTRAINT `sow_documents_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sow_documents` ADD CONSTRAINT `sow_documents_meeting_id_meetings_id_fk` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sow_documents` ADD CONSTRAINT `sow_documents_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transcripts` ADD CONSTRAINT `transcripts_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transcripts` ADD CONSTRAINT `transcripts_meeting_id_meetings_id_fk` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aom_embeddings` ADD CONSTRAINT `aom_embeddings_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aom_embeddings` ADD CONSTRAINT `aom_embeddings_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aom_links` ADD CONSTRAINT `aom_links_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `change_requests` ADD CONSTRAINT `change_requests_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `change_requests` ADD CONSTRAINT `change_requests_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `change_requests` ADD CONSTRAINT `change_requests_requested_by_user_id_users_id_fk` FOREIGN KEY (`requested_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decisions` ADD CONSTRAINT `decisions_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decisions` ADD CONSTRAINT `decisions_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decisions` ADD CONSTRAINT `decisions_approved_by_user_id_users_id_fk` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_documents` ADD CONSTRAINT `knowledge_documents_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_documents` ADD CONSTRAINT `knowledge_documents_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_documents` ADD CONSTRAINT `knowledge_documents_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recommendations` ADD CONSTRAINT `recommendations_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recommendations` ADD CONSTRAINT `recommendations_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recommendations` ADD CONSTRAINT `recommendations_proposed_by_users_id_fk` FOREIGN KEY (`proposed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aeo_audits` ADD CONSTRAINT `aeo_audits_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aeo_audits` ADD CONSTRAINT `aeo_audits_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dmaic_projects` ADD CONSTRAINT `dmaic_projects_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dmaic_projects` ADD CONSTRAINT `dmaic_projects_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dmaic_projects` ADD CONSTRAINT `dmaic_projects_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forecasts` ADD CONSTRAINT `forecasts_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forecasts` ADD CONSTRAINT `forecasts_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `health_scores` ADD CONSTRAINT `health_scores_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `health_scores` ADD CONSTRAINT `health_scores_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lead_audits` ADD CONSTRAINT `lead_audits_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lost_opportunities` ADD CONSTRAINT `lost_opportunities_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lost_opportunities` ADD CONSTRAINT `lost_opportunities_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `process_insights` ADD CONSTRAINT `process_insights_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `process_insights` ADD CONSTRAINT `process_insights_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seasonality_patterns` ADD CONSTRAINT `seasonality_patterns_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seasonality_patterns` ADD CONSTRAINT `seasonality_patterns_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ab_pilots` ADD CONSTRAINT `ab_pilots_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ab_pilots` ADD CONSTRAINT `ab_pilots_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ab_pilots` ADD CONSTRAINT `ab_pilots_creative_asset_id_creative_assets_id_fk` FOREIGN KEY (`creative_asset_id`) REFERENCES `creative_assets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cat_approvals` ADD CONSTRAINT `cat_approvals_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cat_approvals` ADD CONSTRAINT `cat_approvals_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cat_approvals` ADD CONSTRAINT `cat_approvals_creative_asset_id_creative_assets_id_fk` FOREIGN KEY (`creative_asset_id`) REFERENCES `creative_assets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cat_approvals` ADD CONSTRAINT `cat_approvals_requested_by_users_id_fk` FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cat_approvals` ADD CONSTRAINT `cat_approvals_decided_by_user_id_users_id_fk` FOREIGN KEY (`decided_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creative_assets` ADD CONSTRAINT `creative_assets_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creative_assets` ADD CONSTRAINT `creative_assets_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creative_assets` ADD CONSTRAINT `creative_assets_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creative_assets` ADD CONSTRAINT `creative_assets_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cost_tracking` ADD CONSTRAINT `cost_tracking_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cost_tracking` ADD CONSTRAINT `cost_tracking_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_subscription_id_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usage_records` ADD CONSTRAINT `usage_records_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_jobs` ADD CONSTRAINT `ai_jobs_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_jobs` ADD CONSTRAINT `ai_jobs_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_id_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `domain_events` ADD CONSTRAINT `domain_events_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feature_requests` ADD CONSTRAINT `feature_requests_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feature_requests` ADD CONSTRAINT `feature_requests_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feature_requests` ADD CONSTRAINT `feature_requests_submitted_by_users_id_fk` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_rules` ADD CONSTRAINT `notification_rules_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_templates` ADD CONSTRAINT `notification_templates_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `queue_jobs` ADD CONSTRAINT `queue_jobs_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votes` ADD CONSTRAINT `votes_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votes` ADD CONSTRAINT `votes_feature_request_id_feature_requests_id_fk` FOREIGN KEY (`feature_request_id`) REFERENCES `feature_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votes` ADD CONSTRAINT `votes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_deliveries` ADD CONSTRAINT `webhook_deliveries_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_deliveries` ADD CONSTRAINT `webhook_deliveries_endpoint_id_webhook_endpoints_id_fk` FOREIGN KEY (`endpoint_id`) REFERENCES `webhook_endpoints`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_endpoints` ADD CONSTRAINT `webhook_endpoints_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `api_keys_tenant_idx` ON `api_keys` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `users_tenant_idx` ON `users` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `clients_tenant_idx` ON `clients` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `projects_tenant_idx` ON `projects` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `projects_client_idx` ON `projects` (`client_id`);--> statement-breakpoint
CREATE INDEX `integration_logs_tenant_idx` ON `integration_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `integration_logs_integration_idx` ON `integration_logs` (`integration_id`,`started_at`);--> statement-breakpoint
CREATE INDEX `integrations_tenant_idx` ON `integrations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `integrations_client_idx` ON `integrations` (`client_id`);--> statement-breakpoint
CREATE INDEX `integrations_status_idx` ON `integrations` (`status`);--> statement-breakpoint
CREATE INDEX `metric_records_tenant_client_idx` ON `metric_records` (`tenant_id`,`client_id`,`date`);--> statement-breakpoint
CREATE INDEX `metric_records_metric_idx` ON `metric_records` (`client_id`,`metric`,`date`);--> statement-breakpoint
CREATE INDEX `comments_entity_idx` ON `comments` (`tenant_id`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `showcases_client_idx` ON `sprint_showcases` (`client_id`);--> statement-breakpoint
CREATE INDEX `subtasks_task_idx` ON `sub_tasks` (`task_id`);--> statement-breakpoint
CREATE INDEX `tasks_tenant_idx` ON `tasks` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `tasks_assignee_idx` ON `tasks` (`assignee_id`,`status`);--> statement-breakpoint
CREATE INDEX `tasks_dmaic_idx` ON `tasks` (`dmaic_project_id`);--> statement-breakpoint
CREATE INDEX `scorecards_user_period_idx` ON `team_scorecards` (`user_id`,`period_start`);--> statement-breakpoint
CREATE INDEX `tickets_tenant_idx` ON `tickets` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `tickets_client_idx` ON `tickets` (`client_id`,`status`);--> statement-breakpoint
CREATE INDEX `meetings_tenant_idx` ON `meetings` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `meetings_client_idx` ON `meetings` (`client_id`);--> statement-breakpoint
CREATE INDEX `prereq_forms_tenant_idx` ON `prerequisite_forms` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `sow_client_idx` ON `sow_documents` (`client_id`);--> statement-breakpoint
CREATE INDEX `transcripts_meeting_idx` ON `transcripts` (`meeting_id`);--> statement-breakpoint
CREATE INDEX `aom_embeddings_entity_idx` ON `aom_embeddings` (`tenant_id`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `aom_links_from_idx` ON `aom_links` (`tenant_id`,`from_entity_type`,`from_entity_id`);--> statement-breakpoint
CREATE INDEX `aom_links_to_idx` ON `aom_links` (`tenant_id`,`to_entity_type`,`to_entity_id`);--> statement-breakpoint
CREATE INDEX `change_requests_client_idx` ON `change_requests` (`client_id`);--> statement-breakpoint
CREATE INDEX `decisions_tenant_idx` ON `decisions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `decisions_client_idx` ON `decisions` (`client_id`);--> statement-breakpoint
CREATE INDEX `kdocs_tenant_idx` ON `knowledge_documents` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `kdocs_client_idx` ON `knowledge_documents` (`client_id`);--> statement-breakpoint
CREATE INDEX `recommendations_tenant_idx` ON `recommendations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `recommendations_client_status_idx` ON `recommendations` (`client_id`,`status`);--> statement-breakpoint
CREATE INDEX `aeo_audits_client_idx` ON `aeo_audits` (`client_id`);--> statement-breakpoint
CREATE INDEX `dmaic_tenant_idx` ON `dmaic_projects` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dmaic_client_idx` ON `dmaic_projects` (`client_id`);--> statement-breakpoint
CREATE INDEX `forecasts_client_idx` ON `forecasts` (`client_id`,`metric`);--> statement-breakpoint
CREATE INDEX `health_scores_client_idx` ON `health_scores` (`client_id`,`computed_at`);--> statement-breakpoint
CREATE INDEX `lead_audits_tenant_idx` ON `lead_audits` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `lost_opps_client_idx` ON `lost_opportunities` (`client_id`);--> statement-breakpoint
CREATE INDEX `process_insights_tenant_idx` ON `process_insights` (`tenant_id`,`computed_at`);--> statement-breakpoint
CREATE INDEX `seasonality_client_idx` ON `seasonality_patterns` (`client_id`,`metric`);--> statement-breakpoint
CREATE INDEX `ab_pilots_client_idx` ON `ab_pilots` (`client_id`,`status`);--> statement-breakpoint
CREATE INDEX `cat_approvals_client_idx` ON `cat_approvals` (`client_id`,`status`);--> statement-breakpoint
CREATE INDEX `creative_assets_client_idx` ON `creative_assets` (`client_id`,`status`);--> statement-breakpoint
CREATE INDEX `cost_tracking_tenant_idx` ON `cost_tracking` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `cost_tracking_feature_idx` ON `cost_tracking` (`tenant_id`,`feature`);--> statement-breakpoint
CREATE INDEX `invoices_tenant_idx` ON `invoices` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `subscriptions_tenant_idx` ON `subscriptions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `usage_tenant_meter_idx` ON `usage_records` (`tenant_id`,`meter`,`usage_date`);--> statement-breakpoint
CREATE INDEX `ai_jobs_tenant_idx` ON `ai_jobs` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `ai_jobs_type_idx` ON `ai_jobs` (`job_type`,`status`);--> statement-breakpoint
CREATE INDEX `audit_logs_tenant_idx` ON `audit_logs` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `backup_records_type_idx` ON `backup_records` (`backup_type`,`started_at`);--> statement-breakpoint
CREATE INDEX `domain_events_type_idx` ON `domain_events` (`event_type`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `domain_events_tenant_idx` ON `domain_events` (`tenant_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `feature_requests_tenant_idx` ON `feature_requests` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `notif_rules_event_idx` ON `notification_rules` (`tenant_id`,`event_type`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `notifications_tenant_idx` ON `notifications` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `queue_jobs_queue_idx` ON `queue_jobs` (`queue_name`,`status`);--> statement-breakpoint
CREATE INDEX `queue_jobs_bull_idx` ON `queue_jobs` (`bull_job_id`);--> statement-breakpoint
CREATE INDEX `webhook_deliveries_endpoint_idx` ON `webhook_deliveries` (`endpoint_id`,`status`);--> statement-breakpoint
CREATE INDEX `webhook_endpoints_tenant_idx` ON `webhook_endpoints` (`tenant_id`);