-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3308
-- Tiempo de generación: 20-08-2020 a las 10:45:46
-- Versión del servidor: 5.7.28
-- Versión de PHP: 7.3.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `db822598633`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participantmonitoring`
--

DROP TABLE IF EXISTS `participantmonitoring`;
CREATE TABLE IF NOT EXISTS `participantmonitoring` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `trials` longtext CHARACTER SET utf8 COLLATE utf8_bin,
  `replay` longtext NOT NULL,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participantpractice`
--

DROP TABLE IF EXISTS `participantpractice`;
CREATE TABLE IF NOT EXISTS `participantpractice` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `trials` longtext CHARACTER SET utf8 COLLATE utf8_bin,
  `replay` longtext NOT NULL,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participant_category_learning`
--

DROP TABLE IF EXISTS `participant_category_learning`;
CREATE TABLE IF NOT EXISTS `participant_category_learning` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `surveyJs` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `trials` longtext CHARACTER SET utf8 COLLATE utf8_bin,
  `replay` longtext NOT NULL,
  `trained` tinyint(1) DEFAULT NULL,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usersprolific`
--

DROP TABLE IF EXISTS `usersprolific`;
CREATE TABLE IF NOT EXISTS `usersprolific` (
  `id_participant` int(11) NOT NULL AUTO_INCREMENT,
  `prolific_id` varchar(40) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `session_id` varchar(40) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_completed` timestamp NULL DEFAULT NULL,
  `condition_exp` tinyint(4) DEFAULT NULL,
  `colours` longtext NOT NULL,
  `category_colour_association` text NOT NULL,
  `shortMonitoringTask` text NOT NULL,
  `longMonitoringTask` text NOT NULL,
  `completed` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_participant`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
