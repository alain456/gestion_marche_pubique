const seuilModel = require('../models/seuilModel');

exports.getAllSeuils = async (req, res) => {
  try {
    const seuils = await seuilModel.getAll();
    res.json(seuils);
  } catch (error) {
    console.error('Erreur getAllSeuils:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des seuils.' });
  }
};

exports.createSeuil = async (req, res) => {
  try {
    const id = await seuilModel.create(req.body);
    res.status(201).json({ idSeuil: id, message: 'Seuil créé avec succès.' });
  } catch (error) {
    console.error('Erreur createSeuil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du seuil.' });
  }
};

exports.updateSeuil = async (req, res) => {
  try {
    const success = await seuilModel.update(req.params.id, req.body);
    if (!success) return res.status(404).json({ message: 'Seuil non trouvé.' });
    res.json({ message: 'Seuil mis à jour avec succès.' });
  } catch (error) {
    console.error('Erreur updateSeuil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du seuil.' });
  }
};

exports.deleteSeuil = async (req, res) => {
  try {
    const success = await seuilModel.delete(req.params.id);
    if (!success) return res.status(404).json({ message: 'Seuil non trouvé.' });
    res.json({ message: 'Seuil supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteSeuil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du seuil.' });
  }
};
