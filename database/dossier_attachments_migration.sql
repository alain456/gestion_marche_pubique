CREATE TABLE IF NOT EXISTS `piece_jointe_dossier` (
  `idPieceJointe` int NOT NULL AUTO_INCREMENT,
  `typeDossier` varchar(20) NOT NULL,
  `idDossier` int NOT NULL,
  `nomOriginal` varchar(190) NOT NULL,
  `nomStockage` varchar(64) NOT NULL,
  `typeMime` varchar(120) NOT NULL,
  `tailleOctets` bigint unsigned NOT NULL,
  `version` int unsigned NOT NULL,
  `idUser` int DEFAULT NULL,
  `nomUtilisateur` varchar(100) NOT NULL,
  `dateAjout` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idPieceJointe`),
  UNIQUE KEY `uq_piece_jointe_stockage` (`nomStockage`),
  UNIQUE KEY `uq_piece_jointe_version` (`typeDossier`, `idDossier`, `nomOriginal`, `version`),
  KEY `idx_piece_jointe_dossier` (`typeDossier`, `idDossier`, `nomOriginal`, `version`),
  KEY `idx_piece_jointe_user` (`idUser`),
  CONSTRAINT `fk_piece_jointe_user` FOREIGN KEY (`idUser`) REFERENCES `utilisateur` (`idUser`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
