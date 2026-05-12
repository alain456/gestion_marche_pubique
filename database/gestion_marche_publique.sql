-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : mar. 12 mai 2026 à 10:05
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_marche_publique`
--

-- --------------------------------------------------------

--
-- Structure de la table `article`
--

CREATE TABLE `article` (
  `idArticle` int(11) NOT NULL,
  `nomArticle` varchar(100) DEFAULT NULL,
  `typeArticle` enum('fourniture','travaux','service') NOT NULL DEFAULT 'fourniture'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `article`
--

INSERT INTO `article` (`idArticle`, `nomArticle`, `typeArticle`) VALUES
(1, 'ordinateur', 'fourniture'),
(2, 'papier', 'fourniture'),
(3, 'clavier', 'fourniture'),
(4, 'souris', 'fourniture'),
(5, 'stylos', 'fourniture'),
(6, 'Agraffeuse', 'service'),
(7, 'table', 'travaux'),
(8, 'cartouche', 'service');

-- --------------------------------------------------------

--
-- Structure de la table `budget`
--

CREATE TABLE `budget` (
  `idBudget` int(11) NOT NULL,
  `numeroBudget` varchar(50) DEFAULT NULL,
  `typeBudget` enum('fourniture','travaux','service') DEFAULT NULL,
  `exerciceBudgetaire` int(11) DEFAULT NULL,
  `montantEstime` int(11) DEFAULT NULL,
  `sourceFinancier` varchar(100) DEFAULT NULL,
  `statusValidation` varchar(50) DEFAULT NULL,
  `dateValidation` date DEFAULT NULL,
  `responsableFinancier` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `budget`
--

INSERT INTO `budget` (`idBudget`, `numeroBudget`, `typeBudget`, `exerciceBudgetaire`, `montantEstime`, `sourceFinancier`, `statusValidation`, `dateValidation`, `responsableFinancier`) VALUES
(1, NULL, NULL, 2026, 0, NULL, 'Rejete', '2026-04-30', 'alain'),
(2, NULL, NULL, 2027, 3000000, 'Etat', 'Valide', '2026-04-30', 'alain'),
(3, NULL, NULL, 2026, 1234567890, 'Propre', 'Valide', '2026-04-30', 'alain'),
(4, NULL, NULL, 2026, 666666, NULL, 'Rejete', '2026-04-30', 'alain'),
(5, NULL, NULL, 2026, 0, NULL, 'Rejete', '2026-04-30', 'alain'),
(6, NULL, NULL, 2026, 488000, 'Propre', 'Valide', '2026-05-05', 'alain'),
(7, NULL, NULL, 2026, 1000, 'Propre', 'Valide', '2026-05-06', 'alain'),
(8, NULL, NULL, 2026, 200000, 'Etat', 'Valide', '2026-05-07', 'alain'),
(9, 'servicc', 'fourniture', 2026, 0, 'Etat', 'Ouvert', NULL, NULL),
(10, 'ibikoresho', 'travaux', 2026, 0, 'Etat', 'Ouvert', NULL, NULL),
(11, 'm/ser/2026', 'service', 2026, 0, 'Etat', 'Ouvert', NULL, NULL),
(12, 'mais/2026/f002', 'fourniture', 2026, 0, 'Etat', 'Ouvert', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `contrat`
--

CREATE TABLE `contrat` (
  `idContrat` int(11) NOT NULL,
  `idMarche` int(11) DEFAULT NULL,
  `titulaireMarche` varchar(100) DEFAULT NULL,
  `montant` int(11) DEFAULT NULL,
  `dateDebut` date DEFAULT NULL,
  `dateFin` date DEFAULT NULL,
  `dureeContrat` varchar(50) DEFAULT NULL,
  `conditionsContractuelles` varchar(100) DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `demande`
--

CREATE TABLE `demande` (
  `idDemande` int(11) NOT NULL,
  `idService` int(11) DEFAULT NULL,
  `idUser` int(11) DEFAULT NULL,
  `idBudget` int(11) DEFAULT NULL,
  `typeMarche` varchar(50) DEFAULT NULL,
  `dateDemande` timestamp NOT NULL DEFAULT current_timestamp(),
  `statut` varchar(50) DEFAULT NULL,
  `motif` varchar(255) DEFAULT NULL,
  `dateValidation` datetime DEFAULT NULL,
  `responsableFinancier` varchar(255) DEFAULT NULL,
  `montantEstime` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `demande`
--

INSERT INTO `demande` (`idDemande`, `idService`, `idUser`, `idBudget`, `typeMarche`, `dateDemande`, `statut`, `motif`, `dateValidation`, `responsableFinancier`, `montantEstime`) VALUES
(1, 1, NULL, NULL, 'fourniture', '2026-04-29 13:07:40', 'En attente', NULL, NULL, NULL, 0.00),
(10, 1, NULL, NULL, 'fourniture', '2026-04-29 13:17:15', 'En attente', NULL, NULL, NULL, 0.00),
(13, 1, NULL, NULL, 'fourniture', '2026-04-30 07:45:39', 'Rejete', NULL, NULL, NULL, 0.00),
(14, 1, NULL, NULL, 'fourniture', '2026-04-30 07:48:27', 'Rejete', NULL, NULL, NULL, 0.00),
(15, 1, NULL, NULL, 'fourniture', '2026-04-30 08:59:43', 'Valide', NULL, NULL, NULL, 0.00),
(16, 1, NULL, NULL, 'fourniture', '2026-04-30 09:30:53', 'Valide', NULL, NULL, NULL, 0.00),
(17, NULL, NULL, NULL, 'fourniture', '2026-04-30 11:09:58', 'Rejete', NULL, NULL, NULL, 0.00),
(18, NULL, NULL, NULL, 'fourniture', '2026-04-30 11:11:12', 'Valide', NULL, NULL, NULL, 0.00),
(19, NULL, NULL, NULL, 'fourniture', '2026-04-30 11:14:59', 'En attente', NULL, NULL, NULL, 0.00),
(20, 1, NULL, NULL, 'fourniture', '2026-04-30 12:02:23', 'Valide', 'twavyemeye', NULL, NULL, 0.00),
(21, 2, NULL, NULL, 'fourniture', '2026-04-30 12:07:20', 'Rejete', 'twavyanse.', NULL, NULL, 0.00),
(22, NULL, 8, NULL, 'fourniture', '2026-05-06 10:29:32', 'Valide', NULL, NULL, NULL, 0.00),
(23, 1, 6, NULL, 'fourniture', '2026-05-07 08:44:35', 'Valide', NULL, NULL, NULL, 0.00),
(24, 1, 6, NULL, 'fourniture', '2026-05-07 09:34:37', 'Rejete', NULL, NULL, NULL, 0.00),
(25, 1, 6, 9, 'fourniture', '2026-05-07 13:30:23', 'Valide', 'Validé budgétairement', NULL, NULL, 15998.00),
(26, 1, 6, 9, 'fourniture', '2026-05-07 13:58:50', 'En attente', NULL, NULL, NULL, 0.00),
(27, 1, 6, 9, 'fourniture', '2026-05-07 14:07:38', 'Valide', 'vu', NULL, NULL, 403994.00),
(28, 1, 6, 9, 'fourniture', '2026-05-07 14:16:15', 'En attente', NULL, NULL, NULL, 0.00),
(29, 1, 6, 10, 'travaux', '2026-05-08 11:31:59', 'Valide', 'ivyo mwasavye vyemewe reo mushobora kurindira.', NULL, NULL, 2750000.00),
(30, 1, 6, 11, 'service', '2026-05-11 07:44:33', 'Brouillon', NULL, NULL, NULL, 0.00),
(31, 1, 6, 12, 'fourniture', '2026-05-12 07:05:31', 'En attente', NULL, NULL, NULL, 0.00);

-- --------------------------------------------------------

--
-- Structure de la table `execution`
--

CREATE TABLE `execution` (
  `idExecution` int(11) NOT NULL,
  `idMarche` int(11) DEFAULT NULL,
  `livreur` varchar(100) DEFAULT NULL,
  `dateExecution` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `ligne_demande`
--

CREATE TABLE `ligne_demande` (
  `idLigne` int(11) NOT NULL,
  `idDemande` int(11) NOT NULL,
  `idArticle` int(11) NOT NULL,
  `quantite` int(11) NOT NULL,
  `prixUnitaire` decimal(15,2) DEFAULT 0.00,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `ligne_demande`
--

INSERT INTO `ligne_demande` (`idLigne`, `idDemande`, `idArticle`, `quantite`, `prixUnitaire`, `description`) VALUES
(1, 1, 1, 1, 0.00, 'ewewe'),
(8, 1, 1, 1, 0.00, 'ewewe'),
(27, 10, 2, 4, 0.00, 'tttttt44'),
(28, 10, 2, 4, 0.00, 'ssssss'),
(29, 10, 1, 2, 0.00, 'brigtt'),
(30, 13, 1, 2, 0.00, 'alain'),
(31, 14, 2, 2, 0.00, 'ndagukunda'),
(32, 15, 3, 2, 0.00, 'sdfgghhhhhhhhhhhhhhhhhhhh'),
(33, 16, 1, 2, 0.00, 'bbbbbbbbbbbbbbbbbbb'),
(34, 17, 1, 6, 0.00, 'fghjkl'),
(35, 18, 4, 3, 0.00, 'eeeeeeeeeeeeeeeeeeeeee'),
(36, 19, 4, 2, 0.00, 'bbbbbbbbbbbbb'),
(41, 20, 1, 1, 0.00, 'fotofoo'),
(42, 20, 4, 6, 0.00, 'ffffffffffffffffff'),
(43, 21, 1, 8, 0.00, 'hhhhhhh'),
(44, 22, 4, 1, 0.00, 'ndayishaka caane'),
(45, 23, 5, 5, 0.00, 'DFGHGJYJ'),
(46, 23, 3, 1, 0.00, 'EEEEE'),
(47, 24, 2, 5, 0.00, 'ffff'),
(48, 25, 1, 2, 7999.00, 'wwwwwwwwwww'),
(52, 27, 5, 4, 500.00, 'eeeeee'),
(53, 27, 1, 6, 66999.00, 'tttttttttttttttt'),
(54, 26, 4, 1, 0.00, 'qwertyu'),
(55, 28, 2, 5, 0.00, '23456uil;lkjhgfdsasdfg'),
(56, 29, 7, 55, 50000.00, 'eeeeee'),
(58, 30, 6, 1, 0.00, 'zzzz'),
(59, 31, 4, 7, 0.00, 'vvvvvvvv');

-- --------------------------------------------------------

--
-- Structure de la table `marche`
--

CREATE TABLE `marche` (
  `idMarche` int(11) NOT NULL,
  `idDemande` varchar(255) DEFAULT NULL,
  `montantEstime` int(11) DEFAULT NULL,
  `modePassation` varchar(50) DEFAULT NULL,
  `justificationChoix` text DEFAULT NULL,
  `seuilReglementaireApplique` varchar(100) DEFAULT NULL,
  `dateSelection` date DEFAULT NULL,
  `validateur` varchar(100) DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  `dateCloture` date DEFAULT NULL,
  `cloturePar` varchar(100) DEFAULT NULL,
  `commentaire` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `marche`
--

INSERT INTO `marche` (`idMarche`, `idDemande`, `montantEstime`, `modePassation`, `justificationChoix`, `seuilReglementaireApplique`, `dateSelection`, `validateur`, `statut`, `dateCloture`, `cloturePar`, `commentaire`) VALUES
(1, '16', 1234567890, 'AO', NULL, 'Travaux - Admin (> 10M BIF)', '2026-05-04', NULL, 'suspendu', NULL, NULL, NULL),
(2, '15', 3000000, 'AO', NULL, 'Travaux - Admin (> 10M BIF)', '2026-04-28', 'alain', 'cloture', '2026-05-02', 'bugaga', 'n sawa');

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `idNotification` int(11) NOT NULL,
  `idMarche` int(11) DEFAULT NULL,
  `message` varchar(100) DEFAULT NULL,
  `dateEnvoi` date DEFAULT NULL,
  `modeNotification` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `paiement`
--

CREATE TABLE `paiement` (
  `idPaiement` int(11) NOT NULL,
  `idReception` int(11) DEFAULT NULL,
  `montant` int(11) DEFAULT NULL,
  `datePaiement` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reception`
--

CREATE TABLE `reception` (
  `idReception` int(11) NOT NULL,
  `idExecution` int(11) DEFAULT NULL,
  `idContrat` int(11) DEFAULT NULL,
  `typeReception` varchar(50) DEFAULT NULL,
  `dateReception` date DEFAULT NULL,
  `conformite` varchar(50) DEFAULT NULL,
  `observation` text DEFAULT NULL,
  `etat` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

CREATE TABLE `role` (
  `idRole` int(11) NOT NULL,
  `nomRole` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `role`
--

INSERT INTO `role` (`idRole`, `nomRole`) VALUES
(1, 'Admin'),
(2, 'raf'),
(3, 'Chef service'),
(4, 'Chef_institution'),
(5, 'cgmp'),
(6, 'Receptioniste');

-- --------------------------------------------------------

--
-- Structure de la table `servicedemandeur`
--

CREATE TABLE `servicedemandeur` (
  `idService` int(11) NOT NULL,
  `nomService` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `servicedemandeur`
--

INSERT INTO `servicedemandeur` (`idService`, `nomService`) VALUES
(1, 'development'),
(2, 'reseau'),
(4, 'Maintenance');

-- --------------------------------------------------------

--
-- Structure de la table `soumissionnaire`
--

CREATE TABLE `soumissionnaire` (
  `idOffre` int(11) NOT NULL,
  `idMarche` int(11) DEFAULT NULL,
  `nomSoumissionnaire` varchar(100) DEFAULT NULL,
  `adresse` varchar(150) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `referenceAppelOffre` varchar(100) DEFAULT NULL,
  `dateSoumission` date DEFAULT NULL,
  `montantPropose` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `soumissionnaire`
--

INSERT INTO `soumissionnaire` (`idOffre`, `idMarche`, `nomSoumissionnaire`, `adresse`, `telephone`, `email`, `referenceAppelOffre`, `dateSoumission`, `montantPropose`) VALUES
(3, 2, 'nayaho', 'mubimbi', ' elie', 'ucridegushakakwimana@gmail.com', 's/10/2026', '2026-05-11', 20000),
(4, 1, 'mama', 'murwi', '67890345', 'mama@gmail.com', 's/56/067', '2026-05-12', 300000);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `idUser` int(11) NOT NULL,
  `idRole` int(11) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `est_actif` tinyint(1) DEFAULT 1,
  `idService` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`idUser`, `idRole`, `nom`, `email`, `password`, `est_actif`, `idService`) VALUES
(1, 1, 'Administrateur', 'admin@setic.local', '$2b$10$aN8aCjrpR5tslMvPxoYQSeNF9B2eib/KDSfFwEBj79yWYOUIszKnS', 1, NULL),
(5, 1, 'Gushaka Alain', 'alaineucridegushakakwimana@gmail.com', '$2b$10$ICg.2BsGKClVRpbYrBlJoOZ7aSEjTCSITrqVCvZ2.BiwiCFa3TamO', 1, NULL),
(6, 3, 'abby', 'abby@gmail.com', '$2b$10$6JBOQQzmIFI.XcDtmAcKWuP1i1RJNo5pmkMAF7rZxv6G2YTO.FkVy', 1, 1),
(7, 5, 'noe', 'noe@gmail.com', '$2b$10$qvupbjzch6zb92c0DqpFI.iAYfS5AvK57lXHlgEj2ykero08x4yU2', 1, NULL),
(8, 2, 'alain', 'a@gmail.com', '$2b$10$cV.2O3gk2SKidAiEOWI1IucG4e8bq.LFyYyEGMvKchQTO0IwtbkbS', 1, NULL),
(9, 6, 'loraine', 'l@gmail.com', '$2b$10$uPckTIOBgSYbDubkT7s1v.MEso/p5exs5/UjKtcL3n.PKtm6H6X1u', 1, NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `article`
--
ALTER TABLE `article`
  ADD PRIMARY KEY (`idArticle`);

--
-- Index pour la table `budget`
--
ALTER TABLE `budget`
  ADD PRIMARY KEY (`idBudget`);

--
-- Index pour la table `contrat`
--
ALTER TABLE `contrat`
  ADD PRIMARY KEY (`idContrat`),
  ADD UNIQUE KEY `idMarche` (`idMarche`);

--
-- Index pour la table `demande`
--
ALTER TABLE `demande`
  ADD PRIMARY KEY (`idDemande`),
  ADD KEY `idService` (`idService`),
  ADD KEY `fk_demande_user` (`idUser`),
  ADD KEY `fk_demande_budget` (`idBudget`);

--
-- Index pour la table `execution`
--
ALTER TABLE `execution`
  ADD PRIMARY KEY (`idExecution`),
  ADD KEY `idMarche` (`idMarche`);

--
-- Index pour la table `ligne_demande`
--
ALTER TABLE `ligne_demande`
  ADD PRIMARY KEY (`idLigne`),
  ADD KEY `idDemande` (`idDemande`),
  ADD KEY `idArticle` (`idArticle`);

--
-- Index pour la table `marche`
--
ALTER TABLE `marche`
  ADD PRIMARY KEY (`idMarche`),
  ADD KEY `idDemande` (`idDemande`);

--
-- Index pour la table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`idNotification`),
  ADD KEY `idMarche` (`idMarche`);

--
-- Index pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD PRIMARY KEY (`idPaiement`),
  ADD KEY `idReception` (`idReception`);

--
-- Index pour la table `reception`
--
ALTER TABLE `reception`
  ADD PRIMARY KEY (`idReception`),
  ADD KEY `idExecution` (`idExecution`),
  ADD KEY `idContrat` (`idContrat`);

--
-- Index pour la table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`idRole`);

--
-- Index pour la table `servicedemandeur`
--
ALTER TABLE `servicedemandeur`
  ADD PRIMARY KEY (`idService`);

--
-- Index pour la table `soumissionnaire`
--
ALTER TABLE `soumissionnaire`
  ADD PRIMARY KEY (`idOffre`),
  ADD KEY `idMarche` (`idMarche`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`idUser`),
  ADD KEY `idRole` (`idRole`),
  ADD KEY `fk_service` (`idService`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `article`
--
ALTER TABLE `article`
  MODIFY `idArticle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `budget`
--
ALTER TABLE `budget`
  MODIFY `idBudget` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `contrat`
--
ALTER TABLE `contrat`
  MODIFY `idContrat` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `demande`
--
ALTER TABLE `demande`
  MODIFY `idDemande` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT pour la table `execution`
--
ALTER TABLE `execution`
  MODIFY `idExecution` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `ligne_demande`
--
ALTER TABLE `ligne_demande`
  MODIFY `idLigne` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT pour la table `marche`
--
ALTER TABLE `marche`
  MODIFY `idMarche` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `notification`
--
ALTER TABLE `notification`
  MODIFY `idNotification` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `paiement`
--
ALTER TABLE `paiement`
  MODIFY `idPaiement` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reception`
--
ALTER TABLE `reception`
  MODIFY `idReception` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `role`
--
ALTER TABLE `role`
  MODIFY `idRole` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `servicedemandeur`
--
ALTER TABLE `servicedemandeur`
  MODIFY `idService` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `soumissionnaire`
--
ALTER TABLE `soumissionnaire`
  MODIFY `idOffre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `idUser` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `contrat`
--
ALTER TABLE `contrat`
  ADD CONSTRAINT `contrat_ibfk_1` FOREIGN KEY (`idMarche`) REFERENCES `marche` (`idMarche`);

--
-- Contraintes pour la table `demande`
--
ALTER TABLE `demande`
  ADD CONSTRAINT `demande_ibfk_1` FOREIGN KEY (`idService`) REFERENCES `servicedemandeur` (`idService`),
  ADD CONSTRAINT `fk_demande_budget` FOREIGN KEY (`idBudget`) REFERENCES `budget` (`idBudget`),
  ADD CONSTRAINT `fk_demande_user` FOREIGN KEY (`idUser`) REFERENCES `utilisateur` (`idUser`);

--
-- Contraintes pour la table `execution`
--
ALTER TABLE `execution`
  ADD CONSTRAINT `execution_ibfk_1` FOREIGN KEY (`idMarche`) REFERENCES `marche` (`idMarche`);

--
-- Contraintes pour la table `ligne_demande`
--
ALTER TABLE `ligne_demande`
  ADD CONSTRAINT `ligne_demande_ibfk_1` FOREIGN KEY (`idDemande`) REFERENCES `demande` (`idDemande`) ON DELETE CASCADE,
  ADD CONSTRAINT `ligne_demande_ibfk_2` FOREIGN KEY (`idArticle`) REFERENCES `article` (`idArticle`);

--
-- Contraintes pour la table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`idMarche`) REFERENCES `marche` (`idMarche`);

--
-- Contraintes pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD CONSTRAINT `paiement_ibfk_1` FOREIGN KEY (`idReception`) REFERENCES `reception` (`idReception`);

--
-- Contraintes pour la table `reception`
--
ALTER TABLE `reception`
  ADD CONSTRAINT `reception_ibfk_1` FOREIGN KEY (`idExecution`) REFERENCES `execution` (`idExecution`),
  ADD CONSTRAINT `reception_ibfk_2` FOREIGN KEY (`idContrat`) REFERENCES `contrat` (`idContrat`);

--
-- Contraintes pour la table `soumissionnaire`
--
ALTER TABLE `soumissionnaire`
  ADD CONSTRAINT `soumissionnaire_ibfk_1` FOREIGN KEY (`idMarche`) REFERENCES `marche` (`idMarche`);

--
-- Contraintes pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD CONSTRAINT `fk_service` FOREIGN KEY (`idService`) REFERENCES `servicedemandeur` (`idService`),
  ADD CONSTRAINT `utilisateur_ibfk_1` FOREIGN KEY (`idRole`) REFERENCES `role` (`idRole`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
