import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminArticles = () => {
    const [articles, setArticles] = useState([]);
    const [nomArticle, setNomArticle] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    // Configuration des headers avec le token
    const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    };

    const fetchArticles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/articles', config);
            setArticles(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur de chargement");
        }
    };

    useEffect(() => { fetchArticles(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/articles/${editingId}`, { nomArticle }, config);
            } else {
                await axios.post('http://localhost:5000/api/articles', { nomArticle }, config);
            }
            setNomArticle('');
            setEditingId(null);
            fetchArticles();
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cet article ?")) {
            try {
                await axios.delete(`http://localhost:5000/api/articles/${id}`, config);
                fetchArticles();
            } catch (err) {
                alert(err.response?.data?.message || "Erreur lors de la suppression");
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestion des Articles</h1>
            
            {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
                <input
                    type="text"
                    value={nomArticle}
                    onChange={(e) => setNomArticle(e.target.value)}
                    placeholder="Nom de l'article"
                    className="border p-2 rounded w-full"
                    required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    {editingId ? 'Modifier' : 'Ajouter'}
                </button>
                {editingId && (
                    <button onClick={() => {setEditingId(null); setNomArticle('');}} className="bg-gray-400 text-white px-4 py-2 rounded">
                        Annuler
                    </button>
                )}
            </form>

            <table className="w-full border-collapse bg-white shadow-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Nom de l'Article</th>
                        <th className="border p-2 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map(art => (
                        <tr key={art.idArticle}>
                            <td className="border p-2">{art.idArticle}</td>
                            <td className="border p-2">{art.nomArticle}</td>
                            <td className="border p-2 text-center">
                                <button onClick={() => {setEditingId(art.idArticle); setNomArticle(art.nomArticle);}} className="text-blue-600 mr-2">Modifier</button>
                                <button onClick={() => handleDelete(art.idArticle)} className="text-red-600">Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminArticles;