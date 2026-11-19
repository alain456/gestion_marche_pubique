CREATE TABLE IF NOT EXISTS `journal_audit` (
  `idAudit` bigint unsigned NOT NULL AUTO_INCREMENT,
  `idUtilisateur` int NOT NULL,
  `nomUtilisateur` varchar(100) NOT NULL,
  `roleUtilisateur` varchar(50) NOT NULL,
  `methode` varchar(10) NOT NULL,
  `entite` varchar(30) NOT NULL,
  `idEntite` int DEFAULT NULL,
  `route` varchar(255) NOT NULL,
  `codeHttp` smallint unsigned NOT NULL,
  `adresseIp` varchar(45) DEFAULT NULL,
  `agentUtilisateur` varchar(255) DEFAULT NULL,
  `dateAction` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idAudit`),
  KEY `idx_audit_date_id` (`dateAction`, `idAudit`),
  KEY `idx_audit_user_date` (`idUtilisateur`, `dateAction`),
  KEY `idx_audit_entity_date` (`entite`, `dateAction`),
  KEY `idx_audit_method_date` (`methode`, `dateAction`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
