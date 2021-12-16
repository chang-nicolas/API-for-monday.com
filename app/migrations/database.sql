-- Create Main Table (USERS)

CREATE TABLE `users` (
  `userId` VARCHAR(45) NOT NULL,
  `mondayId` VARCHAR(45) NOT NULL,
  `status` VARCHAR(12) NULL,
  PRIMARY KEY (`userId`, `mondayId`));

-- Index Table (USERS)

ALTER TABLE jupiler.user ADD INDEX mondayIndex(mondayId);
ALTER TABLE jupiler.user ADD INDEX statusIndex(status);