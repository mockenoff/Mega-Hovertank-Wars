-- phpMyAdmin SQL Dump
-- version 3.2.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 04, 2010 at 01:46 AM
-- Server version: 5.1.41
-- PHP Version: 5.3.1

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `cs4311`
--
CREATE DATABASE `cs4311` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `cs4311`;

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE IF NOT EXISTS `games` (
  `gid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `starttime` timestamp NULL DEFAULT NULL,
  `user1` int(3) unsigned DEFAULT NULL,
  `status1` tinyint(1) unsigned DEFAULT NULL,
  `user2` int(3) unsigned DEFAULT NULL,
  `status2` tinyint(1) unsigned DEFAULT NULL,
  `user3` int(3) unsigned DEFAULT NULL,
  `status3` tinyint(1) unsigned DEFAULT NULL,
  `user4` int(3) unsigned DEFAULT NULL,
  `status4` tinyint(1) unsigned DEFAULT NULL,
  PRIMARY KEY (`gid`),
  UNIQUE KEY `user1` (`user1`,`user2`,`user3`,`user4`),
  UNIQUE KEY `user1_2` (`user1`),
  UNIQUE KEY `user2` (`user2`),
  UNIQUE KEY `user3` (`user3`),
  UNIQUE KEY `user4` (`user4`),
  UNIQUE KEY `user1_4` (`user1`,`user2`,`user3`,`user4`),
  KEY `user1_3` (`user1`,`user2`,`user3`,`user4`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Ongoing games' AUTO_INCREMENT=1 ;

--
-- Dumping data for table `games`
--


-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `uid` tinyint(3) NOT NULL AUTO_INCREMENT,
  `ip` varchar(15) NOT NULL DEFAULT '0.0.0.0',
  `kills` tinyint(3) NOT NULL DEFAULT '0',
  `deaths` tinyint(3) NOT NULL DEFAULT '0',
  `games` tinyint(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `ip` (`ip`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Users' AUTO_INCREMENT=4 ;

--
-- Dumping data for table `users`
--


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
