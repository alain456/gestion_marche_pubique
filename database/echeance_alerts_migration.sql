CREATE TABLE IF NOT EXISTS `alerte_echeance_config` (
  `cle` varchar(50) NOT NULL,
  `jours` int unsigned NOT NULL,
  `modifieLe` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`cle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `alerte_echeance_config` (`cle`, `jours`) VALUES
  ('demandeValidationJours', 5),
  ('marcheEcheanceJours', 3),
  ('paiementJours', 5);
