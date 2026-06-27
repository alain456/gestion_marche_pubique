-- SETIC Database Dump
SET FOREIGN_KEY_CHECKS=0;

-- Table structure for table `article`
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `idArticle` int(11) NOT NULL AUTO_INCREMENT,
  `nomArticle` varchar(100) DEFAULT NULL,
  `typeArticle` enum('fourniture','travaux','service') NOT NULL DEFAULT 'fourniture',
  `est_actif` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`idArticle`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `article`
INSERT INTO `article` (`idArticle`, `nomArticle`, `typeArticle`, `est_actif`) VALUES
(1, 'ordinateur', 'fourniture', 1),
(2, 'papier', 'fourniture', 1),
(3, 'clavier', 'fourniture', 1),
(4, 'souris', 'fourniture', 1),
(5, 'stylos', 'fourniture', 1),
(7, 'table', 'travaux', 1),
(8, 'cartouche', 'service', 1),
(9, 'Formation en cybersécurité', 'service', 1),
(10, 'Formation sur la maintenance informatique', 'service', 1),
(11, 'Hébergement de serveurs', 'service', 1);

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
  `typeInstitution` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idBudget`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `budget`
INSERT INTO `budget` (`idBudget`, `numeroBudget`, `typeBudget`, `exerciceBudgetaire`, `montantEstime`, `sourceFinancier`, `statusValidation`, `dateValidation`, `responsableFinancier`, `typeInstitution`) VALUES
(5, NULL, NULL, 2026, 0, NULL, 'Rejete', '2026-04-27 22:00:00', 'alain', NULL),
(6, NULL, NULL, 2026, 488000, 'Propre', 'Valide', '2026-05-02 22:00:00', 'alain', NULL),
(7, NULL, NULL, 2026, 1000, 'Propre', 'Valide', '2026-05-03 22:00:00', 'alain', NULL),
(8, NULL, NULL, 2026, 200000, 'Etat', 'Valide', '2026-05-04 22:00:00', 'alain', NULL),
(15, 'BUDGET-2026-S002', 'service', 2026, 0, 'Etat', 'Ouvert', NULL, 'noe', 'Administrations Publiques et Assimilées'),
(16, 'BUDGET-2026-F001', 'fourniture', 2026, 0, 'Etat', 'Ouvert', NULL, 'noe', 'Collectivités Territoriales Décentralisées (Communes)'),
(17, 'BUDGET-2026-T001', 'travaux', 2026, 0, 'Etat', 'Ouvert', NULL, 'noe', 'Collectivités Territoriales Décentralisées (Communes)');

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
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `demande`
INSERT INTO `demande` (`idDemande`, `idService`, `idUser`, `idBudget`, `typeMarche`, `priorite`, `dateDemande`, `statut`, `motif`, `dateValidation`, `responsableFinancier`, `montantEstime`, `modifieParCgmp`, `renvoyee`, `alerteVue`, `alerteRaf`, `alerteChef`) VALUES
(15, 1, NULL, NULL, 'fourniture', 'Normale', '2026-04-30 04:59:43', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(16, 1, NULL, NULL, 'fourniture', 'Normale', '2026-04-30 05:30:53', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(17, NULL, NULL, NULL, 'fourniture', 'Normale', '2026-04-30 07:09:58', 'Rejete', NULL, NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(18, NULL, NULL, NULL, 'fourniture', 'Normale', '2026-04-30 07:11:12', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(19, NULL, NULL, NULL, 'fourniture', 'Normale', '2026-04-30 07:14:59', 'En attente', NULL, NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(20, 1, NULL, NULL, 'fourniture', 'Normale', '2026-04-30 08:02:23', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(21, 2, NULL, NULL, 'fourniture', 'Normale', '2026-04-30 08:07:20', 'Rejete', 'twavyanse.', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(22, NULL, 8, NULL, 'fourniture', 'Normale', '2026-05-06 06:29:32', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(23, 1, 6, NULL, 'fourniture', 'Normale', '2026-05-07 04:44:35', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(24, 1, 6, NULL, 'fourniture', 'Normale', '2026-05-07 05:34:37', 'Rejete', NULL, NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(25, 1, 6, NULL, 'fourniture', 'Normale', '2026-05-07 09:30:23', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '15998.00', 0, 0, 0, 1, 1),
(26, 1, 6, NULL, 'fourniture', 'Normale', '2026-05-07 09:58:50', 'En attente', NULL, NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(27, 1, 6, NULL, 'fourniture', 'Normale', '2026-05-07 10:07:38', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', NULL, NULL, '403994.00', 0, 0, 0, 1, 1),
(28, 1, 6, NULL, 'fourniture', 'Normale', '2026-05-07 10:16:15', 'Inclus dans Marché', 'Inclus dans le Marché Public #4', '2026-05-12 10:11:20', 'alain', '350000.00', 1, 0, 0, 0, 1),
(29, 1, 6, NULL, 'travaux', 'Normale', '2026-05-08 07:31:59', 'Valide', 'vyakunze.....!', '2026-05-13 06:48:54', 'alain', '135000.00', 1, 1, 1, 1, 1),
(30, 1, 6, NULL, 'service', 'Normale', '2026-05-11 03:44:33', 'Valide', 'n sawa', '2026-05-13 09:42:23', 'alain', '90.00', 0, 0, 0, 1, 1),
(31, 1, 6, NULL, 'fourniture', 'Normale', '2026-05-12 03:05:31', 'En attente', NULL, NULL, NULL, '0.00', 0, 0, 0, 1, 1),
(32, 1, 6, NULL, 'fourniture', 'Normale', '2026-05-12 08:49:16', 'Inclus dans Marché', 'Inclus dans le Marché Public #3', '2026-05-13 07:11:14', 'alain', '29000.00', 0, 1, 0, 1, 1),
(33, 1, 6, NULL, 'travaux', 'Normale', '2026-05-12 09:52:53', 'Valide', 'c\'est bon vous avez bien fait..', '2026-05-12 10:25:31', 'alain', '30000.00', 1, 0, 1, 1, 1),
(34, 1, 6, NULL, 'travaux', 'Normale', '2026-05-12 10:35:55', 'Valide', 'twagabanije gatoyaaaaaa', '2026-05-12 10:37:11', 'alain', '3000000.00', 1, 0, 1, 1, 1),
(35, 1, 6, NULL, 'travaux', 'Normale', '2026-05-13 07:23:19', 'Valide', 'sorry twakuyeko 10k', '2026-05-13 07:24:24', 'alain', '160000.00', 1, 0, 0, 0, 1),
(36, 1, 6, 15, 'service', 'Normale', '2026-06-22 12:22:52', 'Inclus dans Marché', 'Inclus dans le Marché Public #5', '2026-06-22 12:32:19', 'alain', '0.00', 0, 0, 0, 1, 1),
(37, 5, 11, 15, 'service', 'Normale', '2026-06-22 12:24:17', 'Inclus dans Marché', 'Inclus dans le Marché Public #5', '2026-06-22 12:32:19', 'alain', '0.00', 0, 0, 0, 1, 1),
(38, 2, 13, 15, 'service', 'Normale', '2026-06-22 12:27:18', 'Inclus dans Marché', 'Inclus dans le Marché Public #5', '2026-06-22 12:32:19', 'alain', '0.00', 0, 0, 0, 1, 1),
(39, 1, 6, 15, 'service', 'Normale', '2026-06-22 12:55:27', 'Inclus dans Marché', 'Inclus dans le Marché Public #5', '2026-06-22 12:56:28', 'alain', '2000000.00', 0, 0, 0, 1, 1),
(40, 2, 13, 15, 'service', 'Normale', '2026-06-22 13:00:25', 'Inclus dans Marché', 'Inclus dans le Marché Public #5', '2026-06-22 13:05:28', 'alain', '1500000.00', 0, 0, 0, 1, 1),
(41, 1, 6, 15, 'service', 'Normale', '2026-06-22 13:09:02', 'Inclus dans Marché', 'Inclus dans le Marché Public #5', '2026-06-22 13:11:30', 'alain', '500000.00', 0, 0, 0, 1, 1),
(42, 2, 13, 16, 'fourniture', 'Normale', '2026-06-25 12:17:19', 'Inclus dans Marché', 'Inclus dans le Marché Public #6', '2026-06-25 12:35:25', 'alain', '4600000.00', 0, 0, 0, 1, 1),
(43, 5, 11, 16, 'fourniture', 'Normale', '2026-06-25 12:32:40', 'Inclus dans Marché', 'Inclus dans le Marché Public #6', '2026-06-25 12:34:30', 'alain', '2400000.00', 0, 0, 0, 1, 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=220 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `historique_demande`
INSERT INTO `historique_demande` (`idHistorique`, `idDemande`, `action`, `statutPrecedent`, `nouveauStatut`, `idUtilisateur`, `nomUtilisateur`, `roleUtilisateur`, `motif`, `dateAction`) VALUES
(1, 35, 'Soumission de la demande', NULL, 'En attente', 6, 'abby', 'CHEF_SERVICE', NULL, '2026-05-13 07:23:19'),
(2, 35, 'Validation Budgétaire (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'nayagabanije', '2026-05-13 07:24:24'),
(3, 30, 'Validation Budgétaire (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'n sawa', '2026-05-13 09:42:23'),
(4, 33, 'Ajustement technique par la CGMP', NULL, NULL, 7, 'noe', 'CGMP', 'c\'est bon vous avez bien fait..', '2026-05-13 09:52:12'),
(5, 35, 'Ajustement technique par la CGMP', NULL, NULL, 7, 'noe', 'CGMP', 'twadugije prix unitaire', '2026-05-14 10:35:55'),
(6, 35, 'Ajustement technique par la CGMP', NULL, NULL, 7, 'noe', 'CGMP', 'sorry twakuyeko 10k', '2026-05-14 10:45:31'),
(7, 28, 'Ajustement technique par la CGMP', NULL, NULL, 7, 'noe', 'CGMP', 'oya mwara mwakabije.', '2026-05-14 12:02:48'),
(8, 28, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 04:46:44'),
(9, 27, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 04:46:44'),
(10, 25, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 04:46:44'),
(11, 23, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 04:46:44'),
(12, 22, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 04:46:44'),
(13, 20, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 04:46:44'),
(14, 18, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 04:46:44'),
(15, 16, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 04:46:44'),
(16, 15, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #4 (Mode: AO)', '2026-05-15 04:46:44'),
(17, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 06:49:34'),
(18, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 06:49:34'),
(19, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 06:49:34'),
(20, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 06:49:34'),
(21, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 06:49:34'),
(22, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 06:49:34'),
(23, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 06:49:34'),
(24, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 06:49:34'),
(25, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-05-15 06:49:34'),
(26, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 06:49:58'),
(27, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 06:49:58'),
(28, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 06:49:58'),
(29, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 06:49:58'),
(30, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 06:49:58'),
(31, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 06:49:58'),
(32, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 06:49:58'),
(33, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 06:49:58'),
(34, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-05-15 06:49:58'),
(35, 32, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 09:42:02'),
(36, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 09:42:02'),
(37, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 09:42:02'),
(38, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 09:42:02'),
(39, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 09:42:02'),
(40, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 09:42:02'),
(41, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 09:42:02'),
(42, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 09:42:02'),
(43, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 09:42:02'),
(44, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #3 est passé au statut : PUBLIE', '2026-05-19 09:42:02'),
(45, 36, 'Soumission de la demande', NULL, 'En attente', 6, 'abby', 'CHEF_SERVICE', NULL, '2026-06-22 12:22:52'),
(46, 37, 'Soumission de la demande', NULL, 'En attente', 11, 'test', 'CHEF_SERVICE', NULL, '2026-06-22 12:24:17'),
(47, 38, 'Soumission de la demande', NULL, 'En attente', 13, 'kelly izere', 'CHEF_SERVICE', NULL, '2026-06-22 12:27:18'),
(48, 38, 'Validation Groupée (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'c\'est valide...!', '2026-06-22 12:32:19'),
(49, 37, 'Validation Groupée (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'c\'est valide...!', '2026-06-22 12:32:19'),
(50, 36, 'Validation Groupée (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'c\'est valide...!', '2026-06-22 12:32:19'),
(51, 39, 'Soumission de la demande', NULL, 'En attente', 6, 'abby', 'CHEF_SERVICE', NULL, '2026-06-22 12:55:27'),
(52, 39, 'Validation Budgétaire (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'twavyemeye.', '2026-06-22 12:56:28'),
(53, 40, 'Soumission de la demande', NULL, 'En attente', 13, 'kelly izere', 'CHEF_SERVICE', NULL, '2026-06-22 13:00:25'),
(54, 40, 'Validation Budgétaire (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'twavyemeye....!', '2026-06-22 13:05:28'),
(55, 41, 'Soumission de la demande', NULL, 'En attente', 6, 'abby', 'CHEF_SERVICE', NULL, '2026-06-22 13:09:02'),
(56, 41, 'Validation Budgétaire (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'egoooo....', '2026-06-22 13:11:30'),
(57, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 10:37:06'),
(58, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 10:37:06'),
(59, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 10:37:06'),
(60, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 10:37:06'),
(61, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 10:37:06'),
(62, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 10:37:06'),
(63, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 10:37:06'),
(64, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 10:37:06'),
(65, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 10:37:06'),
(66, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:21:57'),
(67, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:21:57'),
(68, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:21:57'),
(69, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:21:57'),
(70, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:21:57'),
(71, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:21:57'),
(72, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:21:57'),
(73, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:21:57'),
(74, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:21:57'),
(75, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:22:00'),
(76, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:22:00'),
(77, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:22:00'),
(78, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:22:00'),
(79, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:22:00'),
(80, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:22:00'),
(81, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:22:00'),
(82, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:22:00'),
(83, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:22:00'),
(84, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:22:23'),
(85, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:22:23'),
(86, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:22:23'),
(87, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:22:23'),
(88, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:22:23'),
(89, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:22:23'),
(90, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:22:23'),
(91, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:22:23'),
(92, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:22:23'),
(93, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:23:01'),
(94, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:23:01'),
(95, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:23:01'),
(96, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:23:01'),
(97, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:23:01'),
(98, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:23:01'),
(99, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:23:01'),
(100, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:23:01'),
(101, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:23:01'),
(102, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:23:35'),
(103, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:23:35'),
(104, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:23:35'),
(105, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:23:35'),
(106, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:23:35'),
(107, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:23:35'),
(108, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:23:35'),
(109, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:23:35'),
(110, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:23:35'),
(111, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:24:21'),
(112, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:24:21'),
(113, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:24:21'),
(114, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:24:21'),
(115, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:24:21'),
(116, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:24:22'),
(117, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:24:22'),
(118, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:24:22'),
(119, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : EN ATTENTE', '2026-06-23 11:24:22'),
(120, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:25:22'),
(121, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:25:22'),
(122, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:25:22'),
(123, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:25:22'),
(124, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:25:22'),
(125, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:25:22'),
(126, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:25:22'),
(127, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:25:22'),
(128, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:25:22'),
(129, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 11:26:00'),
(130, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 11:26:00'),
(131, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 11:26:00'),
(132, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 11:26:00'),
(133, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 11:26:00'),
(134, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 11:26:00'),
(135, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 11:26:00'),
(136, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 11:26:00'),
(137, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-23 11:26:00'),
(138, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:26:33'),
(139, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:26:33'),
(140, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:26:33'),
(141, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:26:33'),
(142, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:26:33'),
(143, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:26:33'),
(144, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:26:33'),
(145, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:26:33'),
(146, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-23 11:26:33'),
(147, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 07:19:59'),
(148, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 07:19:59'),
(149, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 07:19:59'),
(150, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 07:19:59'),
(151, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 07:19:59'),
(152, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 07:19:59'),
(153, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 07:19:59'),
(154, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 07:19:59'),
(155, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 07:19:59'),
(156, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-25 07:20:14'),
(157, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-25 07:20:14'),
(158, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-25 07:20:14'),
(159, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-25 07:20:14'),
(160, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-25 07:20:14'),
(161, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-25 07:20:14'),
(162, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-25 07:20:14'),
(163, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-25 07:20:14'),
(164, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : PUBLIE', '2026-06-25 07:20:14'),
(165, 28, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 08:42:06'),
(166, 27, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 08:42:06'),
(167, 25, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 08:42:06'),
(168, 23, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 08:42:06'),
(169, 22, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 08:42:06'),
(170, 20, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 08:42:06'),
(171, 18, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 08:42:06'),
(172, 16, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 08:42:06'),
(173, 15, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #4 est passé au statut : ATTRIBUTION', '2026-06-25 08:42:06'),
(174, 41, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #5 (Mode: Appel d\'offre)', '2026-06-25 11:19:47'),
(175, 40, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #5 (Mode: Appel d\'offre)', '2026-06-25 11:19:47'),
(176, 39, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #5 (Mode: Appel d\'offre)', '2026-06-25 11:19:47'),
(177, 38, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #5 (Mode: Appel d\'offre)', '2026-06-25 11:19:47'),
(178, 37, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #5 (Mode: Appel d\'offre)', '2026-06-25 11:19:47'),
(179, 36, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #5 (Mode: Appel d\'offre)', '2026-06-25 11:19:47'),
(180, 42, 'Soumission de la demande', NULL, 'En attente', 13, 'kelly izere', 'CHEF_SERVICE', NULL, '2026-06-25 12:17:19'),
(181, 43, 'Soumission de la demande', NULL, 'En attente', 11, 'test', 'CHEF_SERVICE', NULL, '2026-06-25 12:32:40'),
(182, 43, 'Validation Budgétaire (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'egoo', '2026-06-25 12:34:30'),
(183, 42, 'Validation Budgétaire (RAF)', NULL, 'Valide', 8, 'alain', 'RAF', 'egoo twavyemeye.', '2026-06-25 12:35:25'),
(184, 43, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #6 (Mode: Appel d\'offre)', '2026-06-25 13:06:15'),
(185, 42, 'Création du Marché Public', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Inclus dans le marché #6 (Mode: Appel d\'offre)', '2026-06-25 13:06:15'),
(186, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 13:37:55'),
(187, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 13:37:55'),
(188, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : EN ATTENTE', '2026-06-25 13:38:22'),
(189, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : EN ATTENTE', '2026-06-25 13:38:22'),
(190, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 13:49:30'),
(191, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 13:49:30'),
(192, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : EN ATTENTE', '2026-06-25 13:56:48'),
(193, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : EN ATTENTE', '2026-06-25 13:56:48'),
(194, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 13:57:03'),
(195, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 13:57:03'),
(196, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : ATTRIBUTION', '2026-06-25 13:57:13'),
(197, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : ATTRIBUTION', '2026-06-25 13:57:13'),
(198, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : CLOTURE', '2026-06-25 13:57:24'),
(199, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : CLOTURE', '2026-06-25 13:57:24'),
(200, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : ATTRIBUTION', '2026-06-25 13:57:31'),
(201, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : ATTRIBUTION', '2026-06-25 13:57:31'),
(202, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 13:57:37'),
(203, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 13:57:37'),
(204, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : SUSPENDU', '2026-06-25 13:57:40'),
(205, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : SUSPENDU', '2026-06-25 13:57:40'),
(206, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 13:58:19'),
(207, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 13:58:19'),
(208, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : EN ATTENTE', '2026-06-25 13:59:55'),
(209, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : EN ATTENTE', '2026-06-25 13:59:55'),
(210, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 14:00:47'),
(211, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 14:00:47'),
(212, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : EN ATTENTE', '2026-06-25 14:06:15'),
(213, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : EN ATTENTE', '2026-06-25 14:06:15'),
(214, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 14:15:35'),
(215, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-25 14:15:35'),
(216, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : EN ATTENTE', '2026-06-25 14:15:40'),
(217, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : EN ATTENTE', '2026-06-25 14:15:40'),
(218, 43, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-27 08:34:27'),
(219, 42, 'Mise à jour du Marché', NULL, 'Inclus dans Marché', 7, 'noe', 'CGMP', 'Le marché #6 est passé au statut : PUBLIE', '2026-06-27 08:34:27');

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
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(76, 28, 2, 5, '70000.00', '23456uil;lkjhgfdsasdfg', NULL, 'Valide', NULL),
(77, 36, 10, 1, '1000000.00', 'dushaka badukorere formation kubijanye na maintanance', '1000000.00', 'Valide', NULL),
(78, 37, 9, 1, '1500000.00', 'formation en sybersecurite', '1500000.00', 'Valide', NULL),
(79, 38, 11, 1, '2000000.00', 'hebergement', '2000000.00', 'Valide', NULL),
(80, 39, 11, 1, '2000000.00', 'fffffffff', '2000000.00', 'Valide', NULL),
(81, 40, 9, 1, '1500000.00', 'mur reseau turashaka formation en cybersecurite', '1500000.00', 'Valide', NULL),
(82, 41, 10, 1, '500000.00', 'vvvvvvvvvvvvvvvvvvvvvvv', '500000.00', 'Valide', NULL),
(83, 42, 3, 2, '300000.00', 'cl', '600000.00', 'Valide', NULL),
(84, 42, 1, 4, '1000000.00', 'ord', '12000000.00', 'Valide', NULL),
(85, 43, 1, 3, '800000.00', 'dell', '2400000.00', 'Valide', NULL);

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
  `dateLimite` datetime DEFAULT NULL,
  PRIMARY KEY (`idMarche`),
  KEY `idDemande` (`idDemande`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `marche`
INSERT INTO `marche` (`idMarche`, `idDemande`, `numeroBudget`, `montantEstime`, `modePassation`, `justificationChoix`, `seuilReglementaireApplique`, `dateSelection`, `validateur`, `statut`, `dateCloture`, `cloturePar`, `commentaire`, `dateLimite`) VALUES
(1, '16', NULL, 1234567890, 'AO', NULL, 'Travaux - Admin (> 10M BIF)', '2026-05-01 22:00:00', NULL, 'suspendu', NULL, NULL, NULL, NULL),
(2, '15', NULL, 3000000, 'AO', NULL, 'Travaux - Admin (> 10M BIF)', '2026-04-25 22:00:00', 'alain', 'cloture', '2026-04-29 22:00:00', 'bugaga', 'n sawa', NULL),
(3, '32,28,27,25,23,22,20,18,16,15', 'BUDGET-2026-F001', 798992, 'AO', NULL, 'Travaux - Admin (> 10M BIF)', '2026-05-11 22:00:00', 'alain', 'publie', NULL, NULL, NULL, NULL),
(4, '28,27,25,23,22,20,18,16,15', 'BUDGET-2026-F001', 769992, NULL, 'hhhhhhhhhh', 'Travaux - Admin (> 10M BIF)', '2026-04-23 22:00:00', 'alain gushakakwimana', 'attribution', NULL, NULL, NULL, NULL),
(5, '41,40,39,38,37,36', 'BUDGET-2026-S001', 4000000, 'Appel d\'offre', NULL, 'kora appel d\'offre', '2026-06-24 22:00:00', NULL, 'en attente', NULL, NULL, NULL, NULL),
(6, '43,42', 'BUDGET-2026-F001', 7000000, 'Appel d\'offre', 'egotek', 'T.AO', '2026-06-08 22:00:00', NULL, 'publie', NULL, NULL, NULL, '2026-06-30 14:15:00');

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

-- Table structure for table `parametre_global`
DROP TABLE IF EXISTS `parametre_global`;
CREATE TABLE `parametre_global` (
  `idParam` int(11) NOT NULL AUTO_INCREMENT,
  `typeParam` varchar(50) NOT NULL,
  `valeur` varchar(100) NOT NULL,
  PRIMARY KEY (`idParam`),
  UNIQUE KEY `typeParam` (`typeParam`,`valeur`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `parametre_global`
INSERT INTO `parametre_global` (`idParam`, `typeParam`, `valeur`) VALUES
(14, 'MODE_PASSATION', 'Appel d\'offre'),
(15, 'MODE_PASSATION', 'Appel restreint'),
(16, 'MODE_PASSATION', 'gre a gre'),
(19, 'MODE_PASSATION', 'Negociation'),
(1, 'TYPE_INSTITUTION', 'Administrations Publiques et Assimilées'),
(3, 'TYPE_INSTITUTION', 'Collectivités Territoriales Décentralisées (Communes)'),
(2, 'TYPE_INSTITUTION', 'Entreprises Publiques à Caractère Commercial'),
(17, 'TYPE_INSTITUTION', 'Instutition public'),
(5, 'TYPE_MARCHE', 'fourniture'),
(18, 'TYPE_MARCHE', 'ikori'),
(6, 'TYPE_MARCHE', 'service'),
(4, 'TYPE_MARCHE', 'travaux');

-- Table structure for table `permission`
DROP TABLE IF EXISTS `permission`;
CREATE TABLE `permission` (
  `idPermission` int(11) NOT NULL AUTO_INCREMENT,
  `codePermission` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idPermission`),
  UNIQUE KEY `codePermission` (`codePermission`)
) ENGINE=InnoDB AUTO_INCREMENT=4369 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `permission`
INSERT INTO `permission` (`idPermission`, `codePermission`, `description`) VALUES
(4, 'CREER_DEMANDE', 'Créer une nouvelle demande d\'achat'),
(5, 'VOIR_BUDGETS', 'Consulter les budgets disponibles'),
(6, 'GERER_MARCHES', 'Gérer les marchés publics et leur exécution'),
(7, 'VALIDER_RECEPTION', 'Valider la réception des articles d\'un marché'),
(8, 'GERER_UTILISATEURS', 'Créer, modifier, désactiver ou supprimer des utilisateurs'),
(9, 'VOIR_UTILISATEURS', 'Consulter la liste des utilisateurs du système'),
(10, 'GERER_ROLES_PERMISSIONS', 'Créer/modifier des rôles et leurs permissions'),
(11, 'GERER_SERVICES', 'Ajouter, modifier ou supprimer des services'),
(12, 'GERER_ARTICLES', 'Gérer le catalogue des articles/produits'),
(13, 'VOIR_STATISTIQUES', 'Accéder aux tableaux de bord et statistiques globales'),
(15, 'VOIR_MES_DEMANDES', 'Consulter ses propres demandes ou celles de son service'),
(16, 'VOIR_TOUTES_DEMANDES', 'Consulter l\'ensemble des demandes du système'),
(17, 'MODIFIER_DEMANDE', 'Modifier une demande avant validation'),
(18, 'SUPPRIMER_DEMANDE', 'Supprimer une demande non encore traitée'),
(19, 'AJUSTER_DEMANDE_CGMP', 'Modifier les quantités ou montants des demandes validées'),
(20, 'GERER_BUDGETS', 'Créer, allouer et modifier des lignes budgétaires'),
(22, 'VALIDER_BUDGET_DEMANDE', 'Valider ou rejeter les demandes par rapport au budget'),
(23, 'VOIR_MARCHES', 'Suivre l\'état d\'avancement des marchés publics'),
(25, 'GERER_SOUMISSIONS', 'Ajouter des soumissionnaires et sélectionner un gagnant'),
(26, 'CREER_CONTRAT', 'Rédiger le contrat pour le soumissionnaire sélectionné'),
(27, 'VALIDER_CONTRAT', 'Éléctroniquement valider et signer le contrat'),
(28, 'ENREGISTRER_EXECUTION', 'Saisir les détails de la livraison/exécution d\'un marché'),
(30, 'VOIR_RECEPTIONS', 'Consulter l\'historique des réceptions'),
(31, 'EFFECTUER_PAIEMENT', 'Ordonner le paiement final d\'un marché réceptionné'),
(32, 'VOIR_PAIEMENTS', 'Consulter l\'historique des paiements effectués'),
(1885, 'DEMANDE_CREATE', 'Créer une demande d\'achat (CRUD Demande)'),
(1886, 'DEMANDE_READ_OWN', 'Lire ses propres demandes (CRUD Demande)'),
(1887, 'DEMANDE_READ_ALL', 'Lire toutes les demandes du système (CRUD Demande)'),
(1888, 'DEMANDE_UPDATE', 'Mettre à jour une demande (CRUD Demande)'),
(1889, 'DEMANDE_DELETE', 'Supprimer une demande (CRUD Demande)');

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

-- Table structure for table `role_permission`
DROP TABLE IF EXISTS `role_permission`;
CREATE TABLE `role_permission` (
  `idRole` int(11) NOT NULL,
  `idPermission` int(11) NOT NULL,
  PRIMARY KEY (`idRole`,`idPermission`),
  KEY `idPermission` (`idPermission`),
  CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`idRole`) REFERENCES `role` (`idRole`) ON DELETE CASCADE,
  CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`idPermission`) REFERENCES `permission` (`idPermission`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `role_permission`
INSERT INTO `role_permission` (`idRole`, `idPermission`) VALUES
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(2, 4),
(2, 5),
(2, 15),
(2, 16),
(2, 17),
(2, 20),
(2, 22),
(2, 31),
(2, 32),
(2, 1885),
(2, 1886),
(2, 1887),
(2, 1888),
(3, 4),
(3, 15),
(3, 17),
(3, 18),
(3, 1885),
(3, 1886),
(3, 1888),
(3, 1889),
(4, 4),
(4, 13),
(4, 15),
(4, 16),
(4, 17),
(4, 18),
(4, 27),
(4, 1885),
(4, 1886),
(4, 1887),
(4, 1888),
(4, 1889),
(5, 5),
(5, 6),
(5, 16),
(5, 19),
(5, 23),
(5, 25),
(5, 26),
(5, 1887),
(6, 4),
(6, 7),
(6, 15),
(6, 17),
(6, 18),
(6, 23),
(6, 25),
(6, 28),
(6, 30),
(6, 1885),
(6, 1886),
(6, 1888),
(6, 1889);

-- Table structure for table `servicedemandeur`
DROP TABLE IF EXISTS `servicedemandeur`;
CREATE TABLE `servicedemandeur` (
  `idService` int(11) NOT NULL AUTO_INCREMENT,
  `nomService` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idService`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `servicedemandeur`
INSERT INTO `servicedemandeur` (`idService`, `nomService`) VALUES
(1, 'development'),
(2, 'reseau'),
(4, 'Maintenance'),
(5, 'Videograph');

-- Table structure for table `seuil_reglementaire`
DROP TABLE IF EXISTS `seuil_reglementaire`;
CREATE TABLE `seuil_reglementaire` (
  `idSeuil` int(11) NOT NULL AUTO_INCREMENT,
  `typeInstitution` varchar(100) DEFAULT 'Administrations Publiques',
  `typeMarche` varchar(50) NOT NULL,
  `montantMin` bigint(20) NOT NULL DEFAULT 0,
  `montantMax` bigint(20) DEFAULT NULL,
  `modePassation` varchar(50) NOT NULL,
  `label` varchar(255) NOT NULL,
  PRIMARY KEY (`idSeuil`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `seuil_reglementaire`
INSERT INTO `seuil_reglementaire` (`idSeuil`, `typeInstitution`, `typeMarche`, `montantMin`, `montantMax`, `modePassation`, `label`) VALUES
(2, 'Administrations Publiques', 'travaux', 1000000, 5000000, 'Appel d\'offre', 'un appel d\'offre'),
(3, 'Administrations Publiques', 'service', 1, 100, 'gre a gre', 'c\'est peu d\'argent'),
(8, 'Collectivités Territoriales Décentralisées (Communes)', 'fourniture', 1000000, 5000000, 'Appel restreint', 'kora appel d\'offre'),
(9, 'Collectivités Territoriales Décentralisées (Communes)', 'fourniture', 1000000, 10000000, 'Appel d\'offre', 'T.AO'),
(10, 'Administrations Publiques et Assimilées', 'fourniture', 0, NULL, 'Appel d\'offre', 'Nouvelle règle');

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
(3, 2, 'nayaho', 'mubimbi', ' elie', 'ucridegushakakwimana@gmail.com', 's/10/2026', '2026-05-08 22:00:00', 20000, NULL, 'en attente', NULL, 0, 1, 'twihwnz igiciroo'),
(4, 1, 'mama', 'murwi', '67890345', 'mama@gmail.com', 's/56/067', '2026-05-09 22:00:00', 300000, NULL, 'en attente', NULL, 0, 0, NULL),
(5, 3, 'Alain GUSHAKAKWIMANA', 'gasenyi', '67920912', 'alaineucridegushakakwimana@gmail.com', 'BUDGET-2026-F001', '2026-05-12 22:00:00', 99999999, NULL, 'en attente', NULL, 0, 0, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `utilisateur`
INSERT INTO `utilisateur` (`idUser`, `idRole`, `nom`, `email`, `password`, `est_actif`, `idService`) VALUES
(1, 1, 'Administrateur', 'admin@setic.local', '$2b$10$FotyNNI8ChAyRptKpGar2.TnEqpWj80YfGGgo81lKQgtOue4AFVim', 1, NULL),
(5, 1, 'Gushaka Alain', 'alaineucridegushakakwimana@gmail.com', '$2b$10$ZWuZBHKlgCunShL/A8/nYO4m4ttuCQaX97iQhVCShBVCS.z5qae32', 1, NULL),
(6, 3, 'abby', 'abby@gmail.com', '$2b$10$/fUmL5T7EXJYIVVmi0TmUOb65Rl2/.VnQ60SWAayqa/iZO5W8S3cq', 1, 1),
(7, 5, 'noe', 'noe@gmail.com', '$2b$10$Acqm/GNrQyiYpiXPrONwiOY9S.vVsd.Ok3pF0dSQD/.OpG8rg20IW', 1, NULL),
(8, 2, 'alain', 'a@gmail.com', '$2b$10$wl30l8jkPWS1w1j/9BkZhejinle3buPY8OLzMoPPawXyEDmCfhYlK', 1, NULL),
(9, 6, 'loraine', 'l@gmail.com', '$2b$10$NFnWr3XQBa2txpqvU3r04ON1ytxS7QilG8pxyrFcBAOoZP1UFc52S', 1, NULL),
(10, 4, 'kagaga', 'k@gmail.com', '$2b$10$VwL105fIPMhhaFp84nKpN..Aj8hS/zryL.Y24IGuT7fvmFT5faIoq', 1, NULL),
(11, 3, 'test', 't@gmail.com', '$2b$10$ilej.slhxpWYCZ6x13qtQOBwhxmHzkn5zUGLWvsBTUulGFf7GnfpC', 1, 5),
(12, 1, 'Gushaka Ciella', 'c@gmail.com', '$2b$10$QtGFmR/4lZVeoE/y.lskIOJhXgWSRWX6LTEol/HLpyS/fhByknHHi', 1, NULL),
(13, 3, 'kelly izere', 'i@gmail.com', '$2b$10$6NnEOgI4eZ96w.J1xrab1u2RsmmrK6RP0OjO1qCQj5gG158KOAp7K', 1, 2);

-- Table structure for table `utilisateur_permission`
DROP TABLE IF EXISTS `utilisateur_permission`;
CREATE TABLE `utilisateur_permission` (
  `idUser` int(11) NOT NULL,
  `idPermission` int(11) NOT NULL,
  `typePermission` enum('GRANT','REVOKE') NOT NULL DEFAULT 'GRANT',
  PRIMARY KEY (`idUser`,`idPermission`),
  KEY `idPermission` (`idPermission`),
  CONSTRAINT `utilisateur_permission_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `utilisateur` (`idUser`) ON DELETE CASCADE,
  CONSTRAINT `utilisateur_permission_ibfk_2` FOREIGN KEY (`idPermission`) REFERENCES `permission` (`idPermission`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `utilisateur_permission`
INSERT INTO `utilisateur_permission` (`idUser`, `idPermission`, `typePermission`) VALUES
(6, 22, 'GRANT'),
(6, 30, 'GRANT'),
(8, 16, 'REVOKE'),
(13, 17, 'REVOKE'),
(13, 18, 'REVOKE'),
(13, 1885, 'REVOKE'),
(13, 1886, 'REVOKE');

SET FOREIGN_KEY_CHECKS=1;
