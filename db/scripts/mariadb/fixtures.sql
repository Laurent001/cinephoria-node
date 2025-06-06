START TRANSACTION;

-- MariaDB dump 10.19  Distrib 10.11.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: cinephoria
-- ------------------------------------------------------
-- Server version	11.5.2-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `auditorium`
--

LOCK TABLES `auditorium` WRITE;
/*!40000 ALTER TABLE `auditorium` DISABLE KEYS */;
INSERT INTO `auditorium` VALUES
(1,1,1,'Salle Nantes 1', 100,5),
(2,1,2,'Salle Nantes 2',150,5),
(3,1,3,'Salle Nantes 3',200,7),
(4,1,4,'Salle Nantes 4',80,10),
(5,2,2,'Salle Bordeaux 1',120,4),
(6,2,3,'Salle Bordeaux 2',180,6),
(7,2,4,'Salle Bordeaux 3',70,9),
(8,2,1,'Salle Bordeaux 4',90,3),
(9,3,3,'Salle Paris 1',120,4),
(10,3,4,'Salle Paris 2',85,11),
(11,3,1,'Salle Paris 3',110,5),
(12,3,2,'Salle Paris 4',140,7),
(13,4,4,'Salle Toulouse 1',75,3),
(14,4,1,'Salle Toulouse 2',95,5),
(15,4,2,'Salle Toulouse 3',130,5),
(16,4,3,'Salle Toulouse 4',190,7),
(17,5,1,'Salle Lille 1',105,10),
(18,5,2,'Salle Lille 2',145,4),      
(19,5,3,'Salle Lille 3',210,6),
(20,5,4,'Salle Lille 4',78,9);
/*!40000 ALTER TABLE `auditorium` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Dumping data for table `cinema`
--

LOCK TABLES `cinema` WRITE;
/*!40000 ALTER TABLE `cinema` DISABLE KEYS */;
INSERT INTO `cinema` VALUES
(1,'Cinéphoria Nantes','1 Rue du Cinéma','Nantes','44000','01.48.65.12.14'),
(2,'Cinéphoria Bordeaux','2 Avenue des Films','Bordeaux','33000','01.48.65.12.14'),
(3,'Cinéphoria Paris','3 Boulevard du 7ème Art','Paris','75001','01.48.65.12.14'),
(4,'Cinéphoria Toulouse','4 Place du Grand Écran','Toulouse','31000','01.48.65.12.14'),
(5,'Cinéphoria Lille','5 Rue des Projecteurs','Lille','59000','01.48.65.12.14');
/*!40000 ALTER TABLE `cinema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `cinema_opening_hours`
--

LOCK TABLES `cinema_opening_hours` WRITE;
/*!40000 ALTER TABLE `cinema_opening_hours` DISABLE KEYS */;
INSERT INTO `cinema_opening_hours` (`cinema_id`, `day_of_week`, `opening_time`, `closing_time`)
VALUES 
(1, 0, '10:00:00', '20:00:00'),
(1, 1, '09:00:00', '22:00:00'),
(1, 2, '09:00:00', '22:00:00'),
(1, 3, '09:00:00', '22:00:00'),
(1, 4, '09:00:00', '23:00:00'),
(1, 5, '10:00:00', '23:30:00'),
(1, 6, '10:00:00', '23:30:00'),
(2, 0, '11:00:00', '19:30:00'),
(2, 1, '10:30:00', '21:30:00'),
(2, 2, '10:30:00', '21:30:00'),
(2, 3, '10:30:00', '21:30:00'),
(2, 4, '10:30:00', '22:30:00'),
(2, 5, '11:30:00', '23:30:00'),
(2, 6, '11:30:00', '23:30:00'),
(3, 0, '12:00:00', '20:30:00'),
(3, 1, '12:30:00', '21:30:00'),
(3, 2, '12:30:00', '21:30:00'),
(3, 3, '12:30:00', '21:30:00'),
(3, 4, '12:30:00', '22:30:00'),
(3, 5, '12:30:00', '23:45:00'),
(3, 6, '12:30:00', '23:45:00'),
(4, 0, '10:00:00', '20:00:00'),
(4, 1, '09:00:00', '22:00:00'),
(4, 2, '09:00:00', '22:00:00'),
(4, 3, '09:00:00', '22:00:00'),
(4, 4, '09:00:00', '23:00:00'),
(4, 5, '10:00:00', '23:30:00'),
(4, 6, '10:00:00', '23:30:00'),
(5, 0, '11:00:00', '19:30:00'),
(5, 1, '10:30:00', '21:30:00'),
(5, 2, '10:30:00', '21:30:00'),
(5, 3, '10:30:00', '21:30:00'),
(5, 4, '10:30:00', '22:30:00'),
(5, 5, '11:30:00', '23:30:00'),
(5, 6, '11:30:00', '23:30:00');
/*!40000 ALTER TABLE `cinema_opening_hours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `cinema_film`
--

LOCK TABLES `cinema_film` WRITE;
/*!40000 ALTER TABLE `cinema_film` DISABLE KEYS */;
INSERT INTO `cinema_film` VALUES
(1,1),
(2,1),
(3,1),
(4,1),
(1,2),
(2,2),
(3,2),
(5,2),
(1,3),
(2,3),
(4,3),
(5,3),
(1,4),
(3,4),
(4,4),
(5,4),
(2,5),
(3,5),
(4,5),
(5,5);
/*!40000 ALTER TABLE `cinema_film` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `film`
--

LOCK TABLES `film` WRITE;
/*!40000 ALTER TABLE `film` DISABLE KEYS */;
INSERT INTO `film` VALUES
(1, 'Matrix', "Matrix, réalisé par les Wachowski et sorti en 1999, est un film de science-fiction révolutionnaire qui explore la nature de la réalité. L\'histoire suit Thomas Anderson, un programmeur informatique qui mène une double vie en tant que hacker sous le nom de Neo. Troublé par des rêves étranges, il est contacté par Morpheus, un rebelle convaincu que Neo est l\'Élu.", '1999-03-31 00:00:00', 13, 0, 'matrix.jpg', null),
(2, 'Chihiro', "Le Voyage de Chihiro, réalisé par Hayao Miyazaki et sorti en 2001, est un chef-d\'œuvre de l\'animation japonaise qui raconte l\'histoire de Chihiro, une fillette de dix ans. Alors qu\'elle se rend avec ses parents vers leur nouvelle maison, la famille se perd et découvre un tunnel mystérieux qui les mène à un parc abandonné.", '2001-07-20 00:00:00', 7, 1, 'chihiro.jpg', null),
(3, 'Dune', "Dune, réalisé par Denis Villeneuve et sorti en 2021, est une adaptation du célèbre roman de science-fiction de Frank Herbert. L\'histoire se déroule dans un futur lointain et suit Paul Atreides, un jeune noble dont la famille, la Maison Atreides, est plongée dans une guerre pour le contrôle de la planète Arrakis, également connue sous le nom de Dune.", '2021-09-15 00:00:00', 12, 1, 'dune.jpg', null),
(4, 'Notting Hill', "Notting Hill, réalisé par Roger Michell et sorti en 1999, est une comédie romantique emblématique qui raconte l\'histoire de William Thacker, un propriétaire de librairie à Londres. Sa vie prend un tournant inattendu lorsqu\'il rencontre Anna Scott, une célèbre actrice d\'Hollywood. Après une série de rencontres fortuites, William et Anna commencent à développer une relation amoureuse malgré les défis qui se dressent entre eux.", '1999-05-28 00:00:00', 10, 1, 'notting_hill.jpg', null),
(5, 'Pulp Fiction', "Pulp Fiction, réalisé par Quentin Tarantino et sorti en 1994, est un film de gangsters emblématique qui raconte plusieurs histoires entrelacées se déroulant dans le monde interlope de Los Angeles. Les personnages principaux incluent Vincent Vega et Jules Winnfield, deux tueurs à gages travaillant pour le gangster Marcellus Wallace.", '1994-10-14 00:00:00', 16, 1, 'pulp_fiction.jpg', null);
/*!40000 ALTER TABLE `film` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Dumping data for table `film_genre`
--

LOCK TABLES `film_genre` WRITE;
/*!40000 ALTER TABLE `film_genre` DISABLE KEYS */;
INSERT INTO `film_genre` VALUES
(1,1),
(1,4),
(1,3),
(2,6),
(2,2),
(2,4),
(3,1),
(3,4),
(4,2),
(4,7),
(5,2),
(5,3);
/*!40000 ALTER TABLE `film_genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `genre`
--

LOCK TABLES `genre` WRITE;
/*!40000 ALTER TABLE `genre` DISABLE KEYS */;
INSERT INTO `genre` VALUES
(1,'Action'),
(2,'Comédie'),
(3,'Drame'),
(4,'Science-Fiction'),
(5,'Horreur'),
(6,'Anime'),
(7,'Romantique');
/*!40000 ALTER TABLE `genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `incident`
--

LOCK TABLES `incident` WRITE;
/*!40000 ALTER TABLE `incident` DISABLE KEYS */;
INSERT INTO `incident` VALUES
(1,1,1,"Projecteur affiche des images floues",'2024-11-15 11:45:00',1),
(2,2,3,"Son grésillant sur les hauts-parleurs gauches",'2024-11-20 11:45:00',1),
(3,3,2,"Tache visible sur l\'écran",'2024-11-25 11:45:00',1),
(4,4,4,"Trois sièges cassés au rang F",'2024-11-30 11:45:00',0),
(5,5,5,"Climatisation trop bruyante",'2024-12-05 11:45:00',1),
(6,6,6,"Éclairage défectueux côté droit",'2024-12-10 11:45:00',1),
(7,7,1,"Problème de mise au point du projecteur",'2024-12-15 11:45:00',1),
(8,8,3,"Absence de son sur le canal central",'2024-12-20 11:45:00',0),
(9,9,2,"Rayure sur l\'écran",'2024-12-25 11:45:00',0),
(10,10,4,"Accoudoir cassé au siège H12",'2024-12-30 11:45:00',1),
(11,11,5,"Climatisation inefficace",'2025-01-04 11:45:00',1),
(12,12,6,"Lumières clignotantes au fond de la salle",'2025-01-09 11:45:00',1),
(13,13,1,"Couleurs délavées à la projection",'2025-01-14 11:45:00',0),
(14,14,3,"Distorsion du son à fort volume",'2025-01-19 11:45:00',1),
(15,15,2,"Pli visible sur l\'écran",'2025-01-24 11:45:00',0),
(16,16,4,"Problème d\'inclinaison sur la rangée J",'2025-01-29 11:45:00',1);
/*!40000 ALTER TABLE `incident` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `material`
--

LOCK TABLES `material` WRITE;
/*!40000 ALTER TABLE `material` DISABLE KEYS */;
INSERT INTO `material` VALUES
(1,'Projecteur','Appareil de projection cinématographique'),
(2,'Écran','Surface de projection'),
(3,'Système audio','Équipement sonore de la salle'),
(4,'Sièges','Fauteuils pour les spectateurs'),
(5,'Climatisation','Système de régulation de la température'),
(6,'Éclairage','Système illumination de la salle');
/*!40000 ALTER TABLE `material` ENABLE KEYS */;
UNLOCK TABLES;



--
-- Dumping data for table `status`
--

LOCK TABLES `status` WRITE;
/*!40000 ALTER TABLE `status` DISABLE KEYS */;
INSERT INTO `status` VALUES
(1,'published'),
(2,'needs approval'),
(3,'blocked');
/*!40000 ALTER TABLE `status` ENABLE KEYS */;
UNLOCK TABLES;




--
-- Dumping data for table `quality`
--

LOCK TABLES `quality` WRITE;
/*!40000 ALTER TABLE `quality` DISABLE KEYS */;
INSERT INTO `quality` VALUES
(1,'Standard',7.00),
(2,'3D',8.50),
(3,'IMAX',14.00),
(4,'4DX',9.50);
/*!40000 ALTER TABLE `quality` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `screening`
--

LOCK TABLES `screening` WRITE;
/*!40000 ALTER TABLE `screening` DISABLE KEYS */;
INSERT INTO screening (film_id, auditorium_id, remaining_seat, remaining_seat_handi, start_time, end_time) VALUES
(1, 1, 100, 5,  '2025-06-01 10:00:00', '2025-06-01 11:45:00'),
(1, 2, 150, 5,  '2025-06-02 16:00:00', '2025-06-02 17:45:00'),
(1, 3, 200, 7,  '2025-06-03 11:00:00', '2025-06-03 12:45:00'),
(1, 4, 80, 10,  '2025-06-04 12:00:00', '2025-06-04 13:45:00'),
(1, 5, 120, 4,  '2025-06-05 13:00:00', '2025-06-05 14:45:00'),
(1, 6, 180, 6,  '2025-06-06 14:00:00', '2025-06-06 15:45:00'),
(1, 7, 70, 9,   '2025-06-07 15:00:00', '2025-06-07 16:45:00'),
(1, 8, 90, 3,   '2025-06-08 16:00:00', '2025-06-08 17:45:00'),
(1, 9, 120, 4,  '2025-06-09 17:00:00', '2025-06-09 18:45:00'),
(1, 10, 85, 11, '2025-06-10 18:00:00', '2025-06-10 19:45:00'),
(1, 10, 85, 4,  '2025-06-11 19:00:00', '2025-06-11 20:45:00'),
(1, 11, 110, 5, '2025-06-12 20:00:00', '2025-06-12 21:45:00'),
(1, 12, 140, 7, '2025-06-13 21:00:00', '2025-06-13 22:45:00'),
(1, 13, 75, 3,  '2025-06-14 22:00:00', '2025-06-14 23:45:00'),
(1, 14, 95, 5,  '2025-06-15 10:00:00', '2025-06-15 11:45:00'),
(1, 15, 130, 5, '2025-06-16 16:00:00', '2025-06-16 17:45:00'),
(1, 16, 190, 7, '2025-06-17 11:00:00', '2025-06-17 12:45:00'),
(1, 7, 70, 3,   '2025-06-22 16:00:00', '2025-06-22 17:45:00'),
(1, 8, 90, 4,   '2025-06-23 17:00:00', '2025-06-23 18:45:00'),
(1, 9, 220, 11, '2025-06-24 18:00:00', '2025-06-24 19:45:00'),
(1, 10, 85, 4,  '2025-06-25 19:00:00', '2025-06-25 20:45:00'),
(1, 11, 110, 5, '2025-06-26 20:00:00', '2025-06-26 21:45:00'),
(1, 12, 140, 7, '2025-06-27 21:00:00', '2025-06-27 22:45:00'),
(1, 13, 75, 3,  '2025-06-28 22:00:00', '2025-06-28 23:45:00'),
(1, 14, 95, 4,  '2025-06-29 23:00:00', '2025-06-29 00:45:00'),
(1, 15, 130, 6, '2025-06-30 10:00:00', '2025-06-30 11:45:00'),
(2, 1, 100, 5,  '2025-06-01 10:00:00', '2025-06-01 11:45:00'),
(2, 2, 150, 5,  '2025-06-02 16:00:00', '2025-06-02 17:45:00'),
(2, 3, 200, 7,  '2025-06-03 11:00:00', '2025-06-03 12:45:00'),
(2, 4, 80, 10,  '2025-06-04 12:00:00', '2025-06-04 13:45:00'),
(2, 5, 120, 4,  '2025-06-05 13:00:00', '2025-06-05 14:45:00'),
(2, 6, 180, 6,  '2025-06-06 14:00:00', '2025-06-06 15:45:00'),
(2, 7, 70, 9,   '2025-06-07 15:00:00', '2025-06-07 16:45:00'),
(2, 8, 90, 3,   '2025-06-08 16:00:00', '2025-06-08 17:45:00'),
(2, 9, 120, 4,  '2025-06-09 17:00:00', '2025-06-09 18:45:00'),
(2, 10, 85, 11, '2025-06-10 18:00:00', '2025-06-10 19:45:00'),
(2, 10, 85, 4,  '2025-06-11 19:00:00', '2025-06-11 20:45:00'),
(2, 11, 110, 5, '2025-06-12 20:00:00', '2025-06-12 21:45:00'),
(2, 12, 140, 7, '2025-06-13 21:00:00', '2025-06-13 22:45:00'),
(2, 17, 105, 10,'2025-06-18 12:00:00', '2025-06-18 13:45:00'),
(2, 18, 145, 4, '2025-06-19 13:00:00', '2025-06-19 14:45:00'),
(2, 19, 210, 6, '2025-06-20 14:00:00', '2025-06-20 15:45:00'),
(2, 20, 78, 9,  '2025-06-21 15:00:00', '2025-06-21 16:45:00'),
(2, 7, 70, 3,   '2025-06-22 16:00:00', '2025-06-22 17:45:00'),
(2, 8, 90, 4,   '2025-06-23 17:00:00', '2025-06-23 18:45:00'),
(2, 9, 220, 11, '2025-06-24 18:00:00', '2025-06-24 19:45:00'),
(2, 10, 85, 4,  '2025-06-25 19:00:00', '2025-06-25 20:45:00'),
(2, 11, 110, 5, '2025-06-26 20:00:00', '2025-06-26 21:45:00'),
(2, 12, 140, 7, '2025-06-27 21:00:00', '2025-06-27 22:45:00'),
(3, 1, 100, 5,  '2025-06-01 10:00:00', '2025-06-01 11:45:00'),
(3, 2, 150, 5,  '2025-06-02 16:00:00', '2025-06-02 17:45:00'),
(3, 3, 200, 7,  '2025-06-03 11:00:00', '2025-06-03 12:45:00'),
(3, 4, 80, 10,  '2025-06-04 12:00:00', '2025-06-04 13:45:00'),
(3, 5, 120, 4,  '2025-06-05 13:00:00', '2025-06-05 14:45:00'),
(3, 6, 180, 6,  '2025-06-06 14:00:00', '2025-06-06 15:45:00'),
(3, 7, 70, 9,   '2025-06-07 15:00:00', '2025-06-07 16:45:00'),
(3, 8, 90, 3,   '2025-06-08 16:00:00', '2025-06-08 17:45:00'),
(3, 13, 75, 3,  '2025-06-14 22:00:00', '2025-06-14 23:45:00'),
(3, 14, 95, 5,  '2025-06-15 10:00:00', '2025-06-15 11:45:00'),
(3, 15, 130, 5, '2025-06-16 16:00:00', '2025-06-16 17:45:00'),
(3, 16, 190, 7, '2025-06-17 11:00:00', '2025-06-17 12:45:00'),
(3, 17, 105, 10,'2025-06-18 12:00:00', '2025-06-18 13:45:00'),
(3, 18, 145, 4, '2025-06-19 13:00:00', '2025-06-19 14:45:00'),
(3, 19, 210, 6, '2025-06-20 14:00:00', '2025-06-20 15:45:00'),
(3, 20, 78, 9,  '2025-06-21 15:00:00', '2025-06-21 16:45:00'),
(3, 7, 70, 3,   '2025-06-22 16:00:00', '2025-06-22 17:45:00'),
(3, 8, 90, 4,   '2025-06-23 17:00:00', '2025-06-23 18:45:00'),
(3, 13, 75, 3,  '2025-06-28 22:00:00', '2025-06-28 23:45:00'),
(3, 14, 95, 4,  '2025-06-29 23:00:00', '2025-06-29 00:45:00'),
(3, 15, 130, 6, '2025-06-30 10:00:00', '2025-06-30 11:45:00'),
(4, 1, 100, 5,  '2025-06-01 10:00:00', '2025-06-01 11:45:00'),
(4, 2, 150, 5,  '2025-06-02 16:00:00', '2025-06-02 17:45:00'),
(4, 3, 200, 7,  '2025-06-03 11:00:00', '2025-06-03 12:45:00'),
(4, 4, 80, 10,  '2025-06-04 12:00:00', '2025-06-04 13:45:00'),
(4, 9, 120, 4,  '2025-06-09 17:00:00', '2025-06-09 18:45:00'),
(4, 10, 85, 11, '2025-06-10 18:00:00', '2025-06-10 19:45:00'),
(4, 10, 85, 4,  '2025-06-11 19:00:00', '2025-06-11 20:45:00'),
(4, 11, 110, 5, '2025-06-12 20:00:00', '2025-06-12 21:45:00'),
(4, 12, 140, 7, '2025-06-13 21:00:00', '2025-06-13 22:45:00'),
(4, 13, 75, 3,  '2025-06-14 22:00:00', '2025-06-14 23:45:00'),
(4, 14, 95, 5,  '2025-06-15 10:00:00', '2025-06-15 11:45:00'),
(4, 15, 130, 5, '2025-06-16 16:00:00', '2025-06-16 17:45:00'),
(4, 16, 190, 7, '2025-06-17 11:00:00', '2025-06-17 12:45:00'),
(4, 17, 105, 10,'2025-06-18 12:00:00', '2025-06-18 13:45:00'),
(4, 18, 145, 4, '2025-06-19 13:00:00', '2025-06-19 14:45:00'),
(4, 19, 210, 6, '2025-06-20 14:00:00', '2025-06-20 15:45:00'),
(4, 20, 78, 9,  '2025-06-21 15:00:00', '2025-06-21 16:45:00'),
(4, 9, 220, 11, '2025-06-24 18:00:00', '2025-06-24 19:45:00'),
(4, 10, 85, 4,  '2025-06-25 19:00:00', '2025-06-25 20:45:00'),
(4, 11, 110, 5, '2025-06-26 20:00:00', '2025-06-26 21:45:00'),
(4, 12, 140, 7, '2025-06-27 21:00:00', '2025-06-27 22:45:00'),
(4, 13, 75, 3,  '2025-06-28 22:00:00', '2025-06-28 23:45:00'),
(4, 14, 95, 4,  '2025-06-29 23:00:00', '2025-06-29 00:45:00'),
(4, 15, 130, 6, '2025-06-30 10:00:00', '2025-06-30 11:45:00'),
(5, 5, 120, 4,  '2025-06-05 13:00:00', '2025-06-05 14:45:00'),
(5, 6, 180, 6,  '2025-06-06 14:00:00', '2025-06-06 15:45:00'),
(5, 7, 70, 9,   '2025-06-07 15:00:00', '2025-06-07 16:45:00'),
(5, 8, 90, 3,   '2025-06-08 16:00:00', '2025-06-08 17:45:00'),
(5, 9, 120, 4,  '2025-06-09 17:00:00', '2025-06-09 18:45:00'),
(5, 10, 85, 11, '2025-06-10 18:00:00', '2025-06-10 19:45:00'),
(5, 10, 85, 4,  '2025-06-11 19:00:00', '2025-06-11 20:45:00'),
(5, 11, 110, 5, '2025-06-12 20:00:00', '2025-06-12 21:45:00'),
(5, 12, 140, 7, '2025-06-13 21:00:00', '2025-06-13 22:45:00'),
(5, 13, 75, 3,  '2025-06-14 22:00:00', '2025-06-14 23:45:00'),
(5, 14, 95, 5,  '2025-06-15 10:00:00', '2025-06-15 11:45:00'),
(5, 15, 130, 5, '2025-06-16 16:00:00', '2025-06-16 17:45:00'),
(5, 16, 190, 7, '2025-06-17 11:00:00', '2025-06-17 12:45:00'),
(5, 17, 105, 10,'2025-06-18 12:00:00', '2025-06-18 13:45:00'),
(5, 18, 145, 4, '2025-06-19 13:00:00', '2025-06-19 14:45:00'),
(5, 19, 210, 6, '2025-06-20 14:00:00', '2025-06-20 15:45:00'),
(5, 20, 78, 9,  '2025-06-21 15:00:00', '2025-06-21 16:45:00'),
(5, 7, 70, 3,   '2025-06-22 16:00:00', '2025-06-22 17:45:00'),
(5, 8, 90, 4,   '2025-06-23 17:00:00', '2025-06-23 18:45:00'),
(5, 9, 220, 11, '2025-06-24 18:00:00', '2025-06-24 19:45:00'),
(5, 10, 85, 4,  '2025-06-25 19:00:00', '2025-06-25 20:45:00'),
(5, 11, 110, 5, '2025-06-26 20:00:00', '2025-06-26 21:45:00'),
(5, 12, 140, 7, '2025-06-27 21:00:00', '2025-06-27 22:45:00'),
(5, 13, 75, 3,  '2025-06-28 22:00:00', '2025-06-28 23:45:00'),
(5, 14, 95, 4,  '2025-06-29 23:00:00', '2025-06-29 00:45:00'),
(5, 15, 130, 6, '2025-06-30 10:00:00', '2025-06-30 11:45:00');
/*!40000 ALTER TABLE `screening` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(1,'admin1@cine.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Jean','Dupont',1,'2024-12-28 17:43:41'),
(2,'admin2@cine.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Marie','Martin',1,'2024-12-28 17:43:41'),
(3,'admin3@cine.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Pierre','Bernard',1,'2024-12-28 17:43:41'),
(4,'admin4@cine.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Sophie','Petit',1,'2024-12-28 17:43:41'),
(5,'emp1@cine.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Luc','Leroy',2,'2024-12-28 17:43:41'),
(6,'emp2@cine.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Emma','Roux',2,'2024-12-28 17:43:41'),
(7,'emp3@cine.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Hugo','Vincent',2,'2024-12-28 17:43:41'),
(8,'emp4@cine.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Camille','Fournier',2,'2024-12-28 17:43:41'),
(9,'user1@example.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Alice','Dubois',2,'2024-12-28 17:45:37'),
(10,'user2@example.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Baptiste','Lefevre',3,'2024-12-28 17:45:37'),
(11,'user3@example.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Camille','Moreau',3,'2024-12-28 17:45:37'),
(12,'user4@example.com','$2b$10$2su2Hpi2WI5Jnu00DdkEBeh3f40p622qpxkC0oEgISq0.rMtTvl76',null,'Daniel','Rousseau',3,'2024-12-28 17:45:37');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES
(1,'admin'),
(2,'staff'),
(3,'user');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;



/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-06  9:16:49

COMMIT;