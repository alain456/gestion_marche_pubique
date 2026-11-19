CREATE TABLE IF NOT EXISTS `notification_lue` (
  `idUser` int(11) NOT NULL,
  `idHistorique` int(11) NOT NULL,
  `dateLecture` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idUser`, `idHistorique`),
  KEY `notification_lue_historique_idx` (`idHistorique`),
  CONSTRAINT `notification_lue_user_fk`
    FOREIGN KEY (`idUser`) REFERENCES `utilisateur` (`idUser`) ON DELETE CASCADE,
  CONSTRAINT `notification_lue_historique_fk`
    FOREIGN KEY (`idHistorique`) REFERENCES `historique_demande` (`idHistorique`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
