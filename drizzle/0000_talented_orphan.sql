CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`wa_from` text NOT NULL,
	`wa_profile_name` text,
	`meal_window_id` text,
	`body_text` text NOT NULL,
	`line_items_json` text,
	`status` text DEFAULT 'received' NOT NULL
);
