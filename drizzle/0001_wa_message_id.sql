ALTER TABLE `orders` ADD `wa_message_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_wa_message_id_unique` ON `orders` (`wa_message_id`);
