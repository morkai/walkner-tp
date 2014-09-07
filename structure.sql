SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `creator` int(10) unsigned NOT NULL,
  `owner` int(10) unsigned NOT NULL,
  `tel` VARCHAR(20) COLLATE utf8_polish_ci NOT NULL DEFAULT '',
  `summary` varchar(100) COLLATE utf8_polish_ci NOT NULL,
  `whenMin` datetime NOT NULL,
  `whenMax` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_A` (`owner`),
  KEY `creator_A` (`creator`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci AUTO_INCREMENT=13 ;

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order` int(10) unsigned NOT NULL,
  `passengers` tinyint(3) unsigned NOT NULL,
  `who` varchar(5000) COLLATE utf8_polish_ci NOT NULL,
  `what` varchar(100) COLLATE utf8_polish_ci NOT NULL,
  `whenFrom` datetime DEFAULT NULL,
  `whenTo` datetime NOT NULL,
  `from` varchar(500) COLLATE utf8_polish_ci NOT NULL,
  `to` varchar(500) COLLATE utf8_polish_ci NOT NULL,
  `symbol` varchar(30) COLLATE utf8_polish_ci NOT NULL DEFAULT '',
  `driver` int(10) unsigned DEFAULT NULL,
  `km` decimal(7,3) unsigned NOT NULL DEFAULT '0.000',
  `hours` smallint(2) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `order_A` (`order`),
  KEY `driver_A` (`driver`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci AUTO_INCREMENT=13 ;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8_polish_ci NOT NULL,
  `login` varchar(50) COLLATE utf8_polish_ci NOT NULL,
  `password` char(64) COLLATE utf8_polish_ci NOT NULL,
  `role` varchar(30) COLLATE utf8_polish_ci NOT NULL DEFAULT 'user',
  `email` varchar(100) COLLATE utf8_polish_ci NOT NULL DEFAULT '',
  `tel` varchar(20) COLLATE utf8_polish_ci NOT NULL DEFAULT '',
  `symbol` varchar(30) COLLATE utf8_polish_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `login_A` (`login`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci AUTO_INCREMENT=6 ;

ALTER TABLE `orders`
  ADD CONSTRAINT `creator_fk` FOREIGN KEY (`creator`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `owner_fk` FOREIGN KEY (`owner`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `order_items`
  ADD CONSTRAINT `driver_FK` FOREIGN KEY (`driver`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `order_FK` FOREIGN KEY (`order`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
