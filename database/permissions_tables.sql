-- Tables pour le système de permissions (Option B)
-- Permet d'ajouter des permissions spécifiques à un utilisateur en plus de son rôle

-- Table des permissions
CREATE TABLE IF NOT EXISTS `permission` (
  `idPermission` int(11) NOT NULL AUTO_INCREMENT,
  `codePermission` varchar(50) NOT NULL UNIQUE,
  `nomPermission` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`idPermission`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Permissions par défaut
INSERT INTO `permission` (`codePermission`, `nomPermission`, `description`) VALUES
('CREATE_DEMANDE', 'Créer une demande', 'Permet de créer de nouvelles demandes'),
('VALIDER_BUDGET', 'Valider un budget', 'Permet de valider les demandes au niveau budgétaire'),
('REJETER_BUDGET', 'Rejeter un budget', 'Permet de rejeter les demandes au niveau budgétaire'),
('LANCER_MARCHE', 'Lancer un marché', 'Permet de lancer des marchés publics'),
('MODIFIER_MARCHE', 'Modifier un marché', 'Permet de modifier les marchés existants'),
('VALIDER_MARCHE', 'Valider un marché', 'Permet de valider les marchés'),
('GERER_CONTRAT', 'Gérer les contrats', 'Permet de gérer les contrats'),
('RECEPTIONNER', 'Réceptionner les livraisons', 'Permet de réceptionner les livraisons'),
('VALIDER_PAIEMENT', 'Valider les paiements', 'Permet de valider les paiements'),
('GERER_UTILISATEURS', 'Gérer les utilisateurs', 'Permet de gérer les utilisateurs du système'),
('GERER_ROLES', 'Gérer les rôles', 'Permet de gérer les rôles du système'),
('GERER_SERVICES', 'Gérer les services', 'Permet de gérer les services'),
('GERER_ARTICLES', 'Gérer les articles', 'Permet de gérer le catalogue d\'articles'),
('VOIR_HISTORIQUE', 'Voir l\'historique', 'Permet de voir l\'historique des actions'),
('EXPORTER_RAPPORTS', 'Exporter des rapports', 'Permet d\'exporter des rapports'),
('GERER_PERMISSIONS', 'Gérer les permissions', 'Permet de gérer les permissions des utilisateurs');

-- Table de liaison rôle-permission
CREATE TABLE IF NOT EXISTS `role_permission` (
  `idRole` int(11) NOT NULL,
  `idPermission` int(11) NOT NULL,
  PRIMARY KEY (`idRole`, `idPermission`),
  FOREIGN KEY (`idRole`) REFERENCES `role` (`idRole`) ON DELETE CASCADE,
  FOREIGN KEY (`idPermission`) REFERENCES `permission` (`idPermission`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table de liaison utilisateur-permission (permissions individuelles)
CREATE TABLE IF NOT EXISTS `utilisateur_permission` (
  `idUser` int(11) NOT NULL,
  `idPermission` int(11) NOT NULL,
  PRIMARY KEY (`idUser`, `idPermission`),
  FOREIGN KEY (`idUser`) REFERENCES `utilisateur` (`idUser`) ON DELETE CASCADE,
  FOREIGN KEY (`idPermission`) REFERENCES `permission` (`idPermission`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Assigner des permissions par défaut aux rôles existants
-- Admin: toutes les permissions
INSERT INTO `role_permission` (`idRole`, `idPermission`)
SELECT 1, idPermission FROM `permission`;

-- RAF: validation budgétaire
INSERT INTO `role_permission` (`idRole`, `idPermission`)
SELECT 2, idPermission FROM `permission` WHERE codePermission IN (
  'VALIDER_BUDGET', 'REJETER_BUDGET', 'VOIR_HISTORIQUE', 'EXPORTER_RAPPORTS'
);

-- Chef Service: créer demandes
INSERT INTO `role_permission` (`idRole`, `idPermission`)
SELECT 3, idPermission FROM `permission` WHERE codePermission IN (
  'CREATE_DEMANDE', 'VOIR_HISTORIQUE'
);

-- Chef Institution: validation marchés
INSERT INTO `role_permission` (`idRole`, `idPermission`)
SELECT 4, idPermission FROM `permission` WHERE codePermission IN (
  'VALIDER_MARCHE', 'VOIR_HISTORIQUE', 'EXPORTER_RAPPORTS'
);

-- CGMP: gestion marchés
INSERT INTO `role_permission` (`idRole`, `idPermission`)
SELECT 5, idPermission FROM `permission` WHERE codePermission IN (
  'LANCER_MARCHE', 'MODIFIER_MARCHE', 'GERER_CONTRAT', 'VOIR_HISTORIQUE', 'EXPORTER_RAPPORTS'
);

-- Receptioniste: réception
INSERT INTO `role_permission` (`idRole`, `idPermission`)
SELECT 6, idPermission FROM `permission` WHERE codePermission IN (
  'RECEPTIONNER', 'VOIR_HISTORIQUE'
);
