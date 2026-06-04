-- SETIC Database Dump
SET FOREIGN_KEY_CHECKS=0;

-- Table structure for table `article`
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `idArticle` int(11) NOT NULL AUTO_INCREMENT,
  `nomArticle` varchar(100) DEFAULT NULL,
  `typeArticle` enum('fourniture','travaux','service') NOT NULL DEFAULT 'fourniture',
  PRIMARY KEY (`idArticle`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `article`
INSERT INTO `article` (`idArticle`, `nomArticle`, `typeArticle`) VALUES
(1, 'ordinateur', 'fourniture'),
(2, 'papier', 'fourniture'),
(3, 'clavier', 'fourniture'),
(4, 'souris', 'fourniture'),
(5, 'stylos', 'fourniture'),
(6, 'Agraffeuse', 'service'),
(7, 'table', 'travaux'),
(8, 'cartouche', 'service');

-- Table structure for table `budget`
DROP TABLE IF EXISTS `budget`;
CREATE TABLE `budget` (
  `idBudget` int(11) NOT NULL AUTO_INCREMENT,
  `numeroBudget` varchar(50) DEFAULT NULL,
  `typeBudget` enum('fourniture','travaux','service') DEFAULT NULL,
  `exerciceBudgetaire` int(11) DEFAULT NULL,
  `montantEstime` int(11) DEFAULT NULL,
  `sourceFinancier` varchar(100) DEFAULT NULL,
  `statusValidation` varchar(50) DEFAULT NULL,
  `dateValidation` date DEFAULT NULL,
  `responsableFinancier` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idBudget`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `budget`
INSERT INTO `budget` (`idBudget`, `numeroBudget`, `typeBudget`, `exerciceBudgetaire`, `montantEstime`, `sourceFinancier`, `statusValidation`, `dateValidation`, `responsableFinancier`) VALUES
(5, NULL, NULL, 2026, 0, NULL, 'Rejete', '2026-04-28 22:00:00', 'alain'),
(6, NULL, NULL, 2026, 488000, 'Propre', 'Valide', '2026-05-03 22:00:00', 'alain'),
(7, NULL, NULL, 2026, 1000, 'Propre', 'Valide', '2026-05-04 22:00:00', 'alain'),
(8, NULL, NULL, 2026, 200000, 'Etat', 'Valide', '2026-05-05 22:00:00', 'alain'),
(10, 'ibikoresho', 'travaux', 2026, 0, 'Etat', 'Ouvert', NULL, NULL),
(11, 'm/ser/2026', 'service', 2026, 0, 'Etat', 'Ouvert', NULL, NULL),
(12, 'mais/2026/f002', 'fourniture', 2026, 0, 'Etat', 'Ouvert', NULL, NULL),
(13, 'BUDGET-2026-T002', 'travaux', 2026, 0, 'Etat', 'Ouvert', NULL, NULL),
(14, 'BUDGET-2026-F001', 'fourniture', 2026, 0, 'Etat', 'Ferme', NULL, NULL);

-- Table structure for table `contrat`
DROP TABLE IF EXISTS `contrat`;
CREATE TABLE `contrat` (
  `idContrat` int(11) NOT NULL AUTO_INCREMENT,
  `idMarche` int(11) DEFAULT NULL,
  `titulaireMarche` varchar(100) DEFAULT NULL,
  `montant` int(11) DEFAULT NULL,
  `dateDebut` date DEFAULT NULL,
  `dateFin` date DEFAULT NULL,
  `dureeContrat` varchar(50) DEFAULT NULL,
  `conditionsContractuelles` varchar(100) DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idContrat`),
  UNIQUE KEY `idMarche` (`idMarche`),
  CONSTRAINT `contrat_ibfk_1` FOREIGN KEY (`idMarche`) REFERENCES `marche` (`idMarche`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `demande`
DROP TABLE IF EXISTS `demande`;
CREATE TABLE `demande` (
  `idDemande` int(11) NOT NULL AUTO_INCREMENT,
  `idService` int(11) DEFAULT NULL,
  `idUser` int(11) DEFAULT NULL,
  `idBudget` int(11) DEFAULT NULL,
  `typeMarche` varchar(50) DEFAULT NULL,
  `priorite` varchar(20) DEFAULT 'Normale',
  `dateDemande` timestamp NOT NULL DEFAULT current_timestamp(),
  `statut` varchar(50) DEFAULT NULL,
  `motif` varchar(255) DEFAULT NULL,
  `dateValidation` datetime DEFAULT NULL,
  `responsableFinancier` varchar(255) DEFAULT NULL,
  `montantEstime` decimal(15,2) DEFAULT 0.00,
  `modifieParCgmp` tinyint(1) DEFAULT 0,
  `renvoyee` tinyint(1) DEFAULT 0,
  `alerteVue` tinyint(1) DEFAULT 0,
  `alerteRaf` tinyint(1) DEFAULT 1,
  `alerteChef` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`idDemande`),
  KEY `idService` (`idService`),
  KEY `fk_demande_user` (`idUser`),
  KEY `fk_demande_budget` (`idBudget`),
  CONSTRAINT `demande_ibfk_1` FOREIGN KEY (`idService`) REFERENCES `servicedemandeur` (`idService`),
  CONSTRAINT `fk_demande_budget` FOREIGN KEY (`idBudget`) REFERENCES `budget` (`idBudget`),
  CONSTRAINT `fk_demande_user` FOREIGN KEY (`idUser`) REFERENCES `utilisateur` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `demande`
INSERT INTO `demande` (`idDemande`, `idService`, `idUser`, `idBudget`, `typeMarche`, `priorite`, `dateDemande`, `statut`, `motif`, `dateValidation`, `responsableFinancier`, `montantEstime`, `modifieParCgmp`, `renvoyee`, `alerteVue`, `alerteRaf`, `alerteChef`) VALUES
(15, 1, NULL, 14, 'fourniture', 'Normale', '2026-04-30 06:59:43', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(16, 1, NULL, 14, 'fourniture', 'Normale', '2026-04-30 07:30:53', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(17, NULL, NULL, 14, 'fourniture', 'Normale', '2026-04-30 09:09:58', 'Rejete', NULL, NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(18, NULL, NULL, 14, 'fourniture', 'Normale', '2026-04-30 09:11:12', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(19, NULL, NULL, 14, 'fourniture', 'Normale', '2026-04-30 09:14:59', 'En attente', NULL, NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(20, 1, NULL, 14, 'fourniture', 'Normale', '2026-04-30 10:02:23', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(21, 2, NULL, 14, 'fourniture', 'Normale', '2026-04-30 10:07:20', 'Rejete', 'twavyanse.', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(22, NULL, 8, 14, 'fourniture', 'Normale', '2026-05-06 08:29:32', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(23, 1, 6, 14, 'fourniture', 'Normale', '2026-05-07 06:44:35', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(24, 1, 6, 14, 'fourniture', 'Normale', '2026-05-07 07:34:37', 'Rejete', NULL, NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(25, 1, 6, 14, 'fourniture', 'Normale', '2026-05-07 11:30:23', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '15998.00', 0, 0, 0, 1, 1),
(26, 1, 6, 14, 'fourniture', 'Normale', '2026-05-07 11:58:50', 'En attente', NULL, NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(27, 1, 6, 14, 'fourniture', 'Normale', '2026-05-07 12:07:38', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '403994.00', 0, 0, 0, 1, 1),
(28, 1, 6, 14, 'fourniture', 'Normale', '2026-05-07 12:16:15', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', '2026-05-12 12:11:20', 'alain', '350000.00', 1, 0, 0, 0, 1),
(29, 1, 6, 10, 'travaux', 'Normale', '2026-05-08 09:31:59', 'Inclus dans Marché', 'Inclus dans le Marché Public #5', '2026-05-13 08:48:54', 'alain', '135000.00', 1, 1, 0, 1, 1),
(30, 1, 6, 11, 'service', 'Normale', '2026-05-11 05:44:33', 'Valide', 'n sawa', '2026-05-13 11:42:23', 'alain', '90.00', 0, 0, 0, 1, 1),
(31, 1, 6, 12, 'fourniture', 'Normale', '2026-05-12 05:05:31', 'En attente', NULL, NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(32, 1, 6, 14, 'fourniture', 'Normale', '2026-05-12 10:49:16', 'Inclus dans Marché', 'Inclus dans le Marché Public #3', '2026-05-13 09:11:14', 'alain', '29000.00', 0, 1, 0, 1, 1),
(33, 1, 6, 13, 'travaux', 'Normale', '2026-05-12 11:52:53', 'Valide', 'c\'est bon vous avez bien fait..', '2026-05-12 12:25:31', 'alain', '30000.00', 1, 0, 1, 1, 1),
(34, 1, 6, 10, 'travaux', 'Normale', '2026-05-12 12:35:55', 'Inclus dans Marché', 'Inclus dans le Marché Public #5', '2026-05-12 12:37:11', 'alain', '3000000.00', 1, 0, 0, 1, 1),
(35, 1, 6, 13, 'travaux', 'Normale', '2026-05-13 09:23:19', 'Valide', 'sorry twakuyeko 10k', '2026-05-13 09:24:24', 'alain', '160000.00', 1, 0, 0, 0, 1);

-- Table structure for table `execution`
DROP TABLE IF EXISTS `execution`;
CREATE TABLE `execution` (
  `idExecution` int(11) NOT NULL AUTO_INCREMENT,
  `idMarche` int(11) DEFAULT NULL,
  `livreur` varchar(100) DEFAULT NULL,
  `dateExecution` date DEFAULT NULL,
  PRIMARY KEY (`idExecution`),
  KEY `idMarche` (`idMarche`),
  CONSTRAINT `execution_ibfk_1` FOREIGN KEY (`idMarche`) REFERENCES `marche` (`idMarche`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `historique_demande`
DROP TABLE IF EXISTS `historique_demande`;
CREATE TABLE `historique_demande` (
  `idHistorique` int(11) NOT NULL AUTO_INCREMENT,
  `idDemande` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `statutPrecedent` varchar(50) DEFAULT NULL,
  `nouveauStatut` varchar(50) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL,
  `nomUtilisateur` varchar(255) DEFAULT NULL,
  `roleUtilisateur` varchar(50) DEFAULT NULL,
  `motif` text DEFAULT NULL,
  `dateAction` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idHistorique`),
  KEY `idDemande` (`idDemande`),
  CONSTRAINT `historique_demande_ibfk_1` FOREIGN KEY (`idDemande`) REFERENCES `demande` (`idDemande`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `historique_demande`
INSERT INTO `historique_demande` (`idHistorique`, `idDemande`, `action`, `statutPrecedent`, `nouveauStatut`, `idUtilisateur`, `nomUtilisateur`, `roleUtilisateur`, `motif`, `dateAction`) VALUES
(1, 35, 'Soumission de la demande', NULL, 'En attente', 6, 'abby', 'CHEF_SERVICE', NULL, '2026-05-13 09:23:19'),
(2, 35, 'Validation Budgétaire (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'nayagabanije', '2026-05-13 09:24:24'),
(3, 30, 'Validation Budgétaire (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'n sawa', '2026-05-13 11:42:23'),
(4, 33, 'Ajustement technique par la CGMP', NULL, NULL, 7, 'noe', 'CGMP', 'c\'est bon vous avez bien fait..', '2026-05-13 11:52:12'),
(5, 35, 'Ajustement technique par la CGMP', NULL, NULL, 7, 'noe', 'CGMP', 'twadugije prix unitaire', '2026-05-14 12:35:55'),
(6, 35, 'Ajustement technique par la CGMP', NULL, NULL, 7, 'noe', 'CGMP', 'sorry twakuyeko 10k', '2026-05-14 12:45:31'),
(7, 28, 'Ajustement technique par la CGMP', NULL, NULL, 7, 'noe', 'CGMP', 'oya mwara mwakabije.', '2026-05-14 14:02:48'),
(8, 28, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 06:46:44'),
(9, 27, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 06:46:44'),
(10, 25, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 06:46:44'),
(11, 23, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 06:46:44'),
(12, 22, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 06:46:44'),
(13, 20, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 06:46:44'),
(14, 18, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 06:46:44'),
(15, 16, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 06:46:44'),
(16, 15, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 06:46:44'),
(17, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 08:49:34'),
(18, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 08:49:34'),
(19, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 08:49:34'),
(20, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 08:49:34'),
(21, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 08:49:34'),
(22, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 08:49:34'),
(23, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 08:49:34'),
(24, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 08:49:34'),
(25, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 08:49:34'),
(26, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 08:49:58'),
(27, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 08:49:58'),
(28, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 08:49:58'),
(29, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 08:49:58'),
(30, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 08:49:58'),
(31, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 08:49:58'),
(32, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 08:49:58'),
(33, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 08:49:58'),
(34, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 08:49:58'),
(35, 32, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 11:42:02'),
(36, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 11:42:02'),
(37, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 11:42:02'),
(38, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 11:42:02'),
(39, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 11:42:02'),
(40, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 11:42:02'),
(41, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 11:42:02'),
(42, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 11:42:02'),
(43, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 11:42:02'),
(44, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 11:42:02'),
(45, 34, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #5 (Mode: PVN)', '2026-05-19 16:25:23'),
(46, 29, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #5 (Mode: PVN)', '2026-05-19 16:25:23'),
(47, 34, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #5 est passé au statut : PUBLIE', '2026-05-19 16:26:38'),
(48, 29, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #5 est passé au statut : PUBLIE', '2026-05-19 16:26:38');

-- Table structure for table `ligne_demande`
DROP TABLE IF EXISTS `ligne_demande`;
CREATE TABLE `ligne_demande` (
  `idLigne` int(11) NOT NULL AUTO_INCREMENT,
  `idDemande` int(11) NOT NULL,
  `idArticle` int(11) NOT NULL,
  `quantite` int(11) NOT NULL,
  `prixUnitaire` decimal(15,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `montant` decimal(15,2) DEFAULT NULL,
  `statut` varchar(50) DEFAULT 'Valide',
  `motif` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idLigne`),
  KEY `idDemande` (`idDemande`),
  KEY `idArticle` (`idArticle`),
  CONSTRAINT `ligne_demande_ibfk_1` FOREIGN KEY (`idDemande`) REFERENCES `demande` (`idDemande`) ON DELETE CASCADE,
  CONSTRAINT `ligne_demande_ibfk_2` FOREIGN KEY (`idArticle`) REFERENCES `article` (`idArticle`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `ligne_demande`
INSERT INTO `ligne_demande` (`idLigne`, `idDemande`, `idArticle`, `quantite`, `prixUnitaire`, `description`, `montant`, `statut`, `motif`) VALUES
(32, 15, 3, 2, '0.00', 'sdfgghhhhhhhhhhhhhhhhhhhh', NULL, 'Valide', NULL),
(33, 16, 1, 2, '0.00', 'bbbbbbbbbbbbbbbbbbb', NULL, 'Valide', NULL),
(34, 17, 1, 6, '0.00', 'fghjkl', NULL, 'Valide', NULL),
(35, 18, 4, 3, '0.00', 'eeeeeeeeeeeeeeeeeeeeee', NULL, 'Valide', NULL),
(36, 19, 4, 2, '0.00', 'bbbbbbbbbbbbb', NULL, 'Valide', NULL),
(41, 20, 1, 1, '0.00', 'fotofoo', NULL, 'Valide', NULL),
(42, 20, 4, 6, '0.00', 'ffffffffffffffffff', NULL, 'Valide', NULL),
(43, 21, 1, 8, '0.00', 'hhhhhhh', NULL, 'Valide', NULL),
(44, 22, 4, 1, '0.00', 'ndayishaka caane', NULL, 'Valide', NULL),
(45, 23, 5, 5, '0.00', 'DFGHGJYJ', NULL, 'Valide', NULL),
(46, 23, 3, 1, '0.00', 'EEEEE', NULL, 'Valide', NULL),
(47, 24, 2, 5, '0.00', 'ffff', NULL, 'Valide', NULL),
(48, 25, 1, 2, '7999.00', 'wwwwwwwwwww', NULL, 'Valide', NULL),
(52, 27, 5, 4, '500.00', 'eeeeee', NULL, 'Valide', NULL),
(53, 27, 1, 6, '66999.00', 'tttttttttttttttt', NULL, 'Valide', NULL),
(54, 26, 4, 1, '0.00', 'qwertyu', NULL, 'Valide', NULL),
(59, 31, 4, 7, '0.00', 'vvvvvvvv', NULL, 'Valide', NULL),
(64, 30, 8, 3, '30.00', 'zzzz', '15000.00', 'Valide', NULL),
(67, 34, 7, 1, '3000000.00', 'imeza zimez neza zinyerera', '500000.00', 'Valide', 'kubrako nayandi ma service akeneye twazigananije.'),
(69, 32, 1, 29, '1000.00', 'dushaka ikomeye', '1000.00', 'Valide', NULL),
(71, 29, 7, 3, '45000.00', 'eeeeee', NULL, 'Valide', NULL),
(73, 33, 7, 2, '15000.00', 'mama', NULL, 'Valide', NULL),
(75, 35, 7, 2, '80000.00', 'qqqqqqqqqqqqqqqqqqqqqqqqqqq', NULL, 'Valide', NULL),
(76, 28, 2, 5, '70000.00', '23456uil;lkjhgfdsasdfg', NULL, 'Valide', NULL);

-- Table structure for table `marche`
DROP TABLE IF EXISTS `marche`;
CREATE TABLE `marche` (
  `idMarche` int(11) NOT NULL AUTO_INCREMENT,
  `idDemande` varchar(255) DEFAULT NULL,
  `numeroBudget` varchar(100) DEFAULT NULL,
  `montantEstime` int(11) DEFAULT NULL,
  `modePassation` varchar(50) DEFAULT NULL,
  `justificationChoix` text DEFAULT NULL,
  `seuilReglementaireApplique` varchar(100) DEFAULT NULL,
  `dateSelection` date DEFAULT NULL,
  `validateur` varchar(100) DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  `dateCloture` date DEFAULT NULL,
  `cloturePar` varchar(100) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  PRIMARY KEY (`idMarche`),
  KEY `idDemande` (`idDemande`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `marche`
INSERT INTO `marche` (`idMarche`, `idDemande`, `numeroBudget`, `montantEstime`, `modePassation`, `justificationChoix`, `seuilReglementaireApplique`, `dateSelection`, `validateur`, `statut`, `dateCloture`, `cloturePar`, `commentaire`) VALUES
(1, '16', NULL, 1234567890, 'AO', NULL, 'Travaux - Admin (> 10M BIF)', '2026-05-02 22:00:00', NULL, 'suspendu', NULL, NULL, NULL),
(2, '15', NULL, 3000000, 'AO', NULL, 'Travaux - Admin (> 10M BIF)', '2026-04-26 22:00:00', 'alain', 'cloture', '2026-04-30 22:00:00', 'bugaga', 'n sawa'),
(3, '32,28,27,25,23,22,20,18,16,15', 'BUDGET-2026-F001', 798992, 'AO', NULL, 'Travaux - Admin (> 10M BIF)', '2026-05-12 22:00:00', 'alain', 'publie', NULL, NULL, NULL),
(4, '28,27,25,23,22,20,18,16,15', 'BUDGET-2026-F001', 769992, 'AO', 'wertyuiop[', 'Travaux - Admin (> 10M BIF)', '2026-05-07 22:00:00', 'alain gushakakwimana', 'publie', NULL, NULL, NULL),
(5, '34,29', 'ibikoresho', 3135000, 'PVN', 'vvvvv', 'Travaux - Admin (> 10M BIF)', '2026-05-17 22:00:00', 'bbb', 'publie', NULL, 'abby', NULL);

-- Table structure for table `notification`
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `idNotification` int(11) NOT NULL AUTO_INCREMENT,
  `idMarche` int(11) DEFAULT NULL,
  `message` varchar(100) DEFAULT NULL,
  `dateEnvoi` date DEFAULT NULL,
  `modeNotification` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idNotification`),
  KEY `idMarche` (`idMarche`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`idMarche`) REFERENCES `marche` (`idMarche`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `paiement`
DROP TABLE IF EXISTS `paiement`;
CREATE TABLE `paiement` (
  `idPaiement` int(11) NOT NULL AUTO_INCREMENT,
  `idReception` int(11) DEFAULT NULL,
  `montant` int(11) DEFAULT NULL,
  `datePaiement` date DEFAULT NULL,
  PRIMARY KEY (`idPaiement`),
  KEY `idReception` (`idReception`),
  CONSTRAINT `paiement_ibfk_1` FOREIGN KEY (`idReception`) REFERENCES `reception` (`idReception`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `reception`
DROP TABLE IF EXISTS `reception`;
CREATE TABLE `reception` (
  `idReception` int(11) NOT NULL AUTO_INCREMENT,
  `idExecution` int(11) DEFAULT NULL,
  `idContrat` int(11) DEFAULT NULL,
  `typeReception` varchar(50) DEFAULT NULL,
  `dateReception` date DEFAULT NULL,
  `conformite` varchar(50) DEFAULT NULL,
  `observation` text DEFAULT NULL,
  `etat` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idReception`),
  KEY `idExecution` (`idExecution`),
  KEY `idContrat` (`idContrat`),
  CONSTRAINT `reception_ibfk_1` FOREIGN KEY (`idExecution`) REFERENCES `execution` (`idExecution`),
  CONSTRAINT `reception_ibfk_2` FOREIGN KEY (`idContrat`) REFERENCES `contrat` (`idContrat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `role`
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `idRole` int(11) NOT NULL AUTO_INCREMENT,
  `nomRole` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idRole`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `role`
INSERT INTO `role` (`idRole`, `nomRole`) VALUES
(1, 'Admin'),
(2, 'raf'),
(3, 'Chef service'),
(4, 'Chef_institution'),
(5, 'cgmp'),
(6, 'Receptioniste');

-- Table structure for table `servicedemandeur`
DROP TABLE IF EXISTS `servicedemandeur`;
CREATE TABLE `servicedemandeur` (
  `idService` int(11) NOT NULL AUTO_INCREMENT,
  `nomService` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idService`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `servicedemandeur`
INSERT INTO `servicedemandeur` (`idService`, `nomService`) VALUES
(1, 'development'),
(2, 'reseau'),
(4, 'Maintenance');

-- Table structure for table `soumissionnaire`
DROP TABLE IF EXISTS `soumissionnaire`;
CREATE TABLE `soumissionnaire` (
  `idOffre` int(11) NOT NULL AUTO_INCREMENT,
  `idMarche` int(11) DEFAULT NULL,
  `nomSoumissionnaire` varchar(100) DEFAULT NULL,
  `adresse` varchar(150) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `referenceAppelOffre` varchar(100) DEFAULT NULL,
  `dateSoumission` date DEFAULT NULL,
  `montantPropose` bigint(20) DEFAULT NULL,
  `delaiLivraison` varchar(100) DEFAULT NULL,
  `statut` varchar(50) DEFAULT 'en attente',
  `motif` text DEFAULT NULL,
  `demandeModification` tinyint(1) DEFAULT 0,
  `autorisationModification` tinyint(1) DEFAULT 0,
  `motifModification` text DEFAULT NULL,
  PRIMARY KEY (`idOffre`),
  KEY `idMarche` (`idMarche`),
  CONSTRAINT `soumissionnaire_ibfk_1` FOREIGN KEY (`idMarche`) REFERENCES `marche` (`idMarche`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `soumissionnaire`
INSERT INTO `soumissionnaire` (`idOffre`, `idMarche`, `nomSoumissionnaire`, `adresse`, `telephone`, `email`, `referenceAppelOffre`, `dateSoumission`, `montantPropose`, `delaiLivraison`, `statut`, `motif`, `demandeModification`, `autorisationModification`, `motifModification`) VALUES
(3, 2, 'nayaho', 'mubimbi', ' elie', 'ucridegushakakwimana@gmail.com', 's/10/2026', '2026-05-09 22:00:00', 20000, NULL, 'en attente', NULL, 0, 1, 'twihwnz igiciroo'),
(4, 1, 'mama', 'murwi', '67890345', 'mama@gmail.com', 's/56/067', '2026-05-10 22:00:00', 300000, NULL, 'en attente', NULL, 0, 0, NULL),
(5, 3, 'Alain GUSHAKAKWIMANA', 'gasenyi', '67920912', 'alaineucridegushakakwimana@gmail.com', 'BUDGET-2026-F001', '2026-05-13 22:00:00', 99999999, NULL, 'en attente', NULL, 0, 0, NULL);

-- Table structure for table `utilisateur`
DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE `utilisateur` (
  `idUser` int(11) NOT NULL AUTO_INCREMENT,
  `idRole` int(11) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `est_actif` tinyint(1) DEFAULT 1,
  `idService` int(11) DEFAULT NULL,
  PRIMARY KEY (`idUser`),
  KEY `idRole` (`idRole`),
  KEY `fk_service` (`idService`),
  CONSTRAINT `fk_service` FOREIGN KEY (`idService`) REFERENCES `servicedemandeur` (`idService`),
  CONSTRAINT `utilisateur_ibfk_1` FOREIGN KEY (`idRole`) REFERENCES `role` (`idRole`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `utilisateur`
INSERT INTO `utilisateur` (`idUser`, `idRole`, `nom`, `email`, `password`, `est_actif`, `idService`) VALUES
(1, 1, 'Administrateur', 'admin@setic.local', '$2b$10$wlF33vyURiQWRaAY5YZupetzuUHin0zejRJad0wngwEa2lgkHROOS', 1, NULL),
(5, 1, 'Gushaka Alain', 'alaineucridegushakakwimana@gmail.com', '$2b$10$ZWuZBHKlgCunShL/A8/nYO4m4ttuCQaX97iQhVCShBVCS.z5qae32', 1, NULL),
(6, 3, 'abby', 'abby@gmail.com', '$2b$10$/fUmL5T7EXJYIVVmi0TmUOb65Rl2/.VnQ60SWAayqa/iZO5W8S3cq', 1, 1),
(7, 5, 'noe', 'noe@gmail.com', '$2b$10$Acqm/GNrQyiYpiXPrONwiOY9S.vVsd.Ok3pF0dSQD/.OpG8rg20IW', 1, NULL),
(8, 2, 'alain', 'a@gmail.com', '$2b$10$wl30l8jkPWS1w1j/9BkZhejinle3buPY8OLzMoPPawXyEDmCfhYlK', 1, NULL),
(9, 6, 'loraine', 'l@gmail.com', '$2b$10$NFnWr3XQBa2txpqvU3r04ON1ytxS7QilG8pxyrFcBAOoZP1UFc52S', 1, NULL),
(10, 4, 'kagaga', 'k@gmail.com', '$2b$10$VwL105fIPMhhaFp84nKpN..Aj8hS/zryL.Y24IGuT7fvmFT5faIoq', 1, NULL),
(11, 1, 'Brigitte Nahayo', 'brigittenahayo5@gmail.com', '$2b$10$qbodqQZbuNns4JkfUWh3yOIdrHE8w9KzvPQUl/ZFP6G3Nc0q5SbjW', 1, NULL),
(12, 3, 'keza bella', 'kezabelle@gmail.com', '$2b$10$o6qD2npP91cwy9I/PqrEQOVxLsao7Zd3a/aOdOqJZmC5qPKxi4snK', 1, 4);

SET FOREIGN_KEY_CHECKS=1;
