ALTER TABLE `reception`
  ADD COLUMN `responsable` varchar(100) DEFAULT NULL;

ALTER TABLE `paiement`
  ADD COLUMN `responsable` varchar(100) DEFAULT NULL;
