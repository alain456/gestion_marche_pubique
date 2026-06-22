const parametreModel = require('../models/parametreModel');

exports.getAllParametres = async (req, res) => {
  try {
    const typeParam = req.query.type;
    let parametres;
    if (typeParam) {
      parametres = await parametreModel.getByType(typeParam);
    } else {
      parametres = await parametreModel.getAll();
    }
    res.json(parametres);
  } catch (error) {
    console.error('Erreur getAllParametres:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des paramètres.' });
  }
};

exports.createParametre = async (req, res) => {
  try {
    const { typeParam, valeur } = req.body;
    if (!typeParam || !valeur) {
      return res.status(400).json({ message: 'typeParam et valeur sont requis.' });
    }
    const id = await parametreModel.create({ typeParam, valeur });
    res.status(201).json({ idParam: id, message: 'Paramètre créé avec succès.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Cette valeur existe déjà pour ce type de paramètre.' });
    }
    console.error('Erreur createParametre:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du paramètre.' });
  }
};

exports.deleteParametre = async (req, res) => {
  try {
    const success = await parametreModel.delete(req.params.id);
    if (!success) return res.status(404).json({ message: 'Paramètre non trouvé.' });
    res.json({ message: 'Paramètre supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteParametre:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du paramètre.' });
  }
};
