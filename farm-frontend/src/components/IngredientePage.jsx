import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IngredientePage.css';

const API_URL = 'http://localhost:8080/api';

const IngredientePage = () => {
    const [ingrediente, setIngrediente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentIngredient, setCurrentIngredient] = useState(null);
    const IngredientePage = ({ initialShowForm = false }) => {
        const [showAddForm, setShowAddForm] = useState(initialShowForm);
        // restul codului rămâne la fel
    };
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        unitateMasura: 'kg',
        price: '',
        userId: 1
    });

    useEffect(() => {
        fetchIngrediente();
    }, []);

    const fetchIngrediente = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/ingrediente/all?userId=1`);
            setIngrediente(response.data);
            setError(null);
        } catch (err) {
            setError('Eroare la încărcarea ingredientelor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'price' ? parseInt(value) || '' : value
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            unitateMasura: 'kg',
            price: '',
            userId: 1
        });
        setEditMode(false);
        setCurrentIngredient(null);
        setShowAddForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode && currentIngredient) {
                // UPDATE
                await axios.put(
                    `${API_URL}/ingrediente/update/${currentIngredient.id}?userId=1`,
                    {
                        name: formData.name,
                        unitateMasura: formData.unitateMasura,
                        price: parseInt(formData.price)
                    }
                );
            } else {
                // CREATE
                await axios.post(`${API_URL}/ingrediente/add`, formData);
            }

            fetchIngrediente();
            resetForm();
        } catch (err) {
            if (err.response?.status === 409) {
                alert('Există deja un ingredient cu acest nume!');
            } else {
                alert('Eroare la salvare!');
            }
            console.error(err);
        }
    };

    const handleEdit = (ingredient) => {
        setFormData({
            name: ingredient.name,
            unitateMasura: ingredient.unitateMasura,
            price: ingredient.price,
            userId: ingredient.userId
        });
        setEditMode(true);
        setCurrentIngredient(ingredient);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Sigur vrei să ștergi acest ingredient?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/ingrediente/delete/${id}?userId=1`);
            fetchIngrediente();
        } catch (err) {
            alert('Eroare la ștergere!');
            console.error(err);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (loading) return <div className="loading">Se încarcă...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Ingrediente</h1>
                <button
                    className="btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Anulează' : '+ Adaugă Ingredient'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="form-container">
                    <h2>{editMode ? 'Editează Ingredient' : 'Adaugă Ingredient Nou'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nume Ingredient:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Unitate de Măsură:</label>
                            <select
                                name="unitateMasura"
                                value={formData.unitateMasura}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="kg">Kilogram (kg)</option>
                                <option value="g">Gram (g)</option>
                                <option value="l">Litr (l)</option>
                                <option value="ml">Mililitru (ml)</option>
                                <option value="buc">Bucată</option>
                                <option value="balot">Balot</option>
                                <option value="sac">Sac</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Preț (RON):</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                min="0"
                                step="1"
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-success">
                                {editMode ? 'Actualizează' : 'Salvează'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nume</th>
                            <th>Unitate</th>
                            <th>Preț</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingrediente.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    Nu există ingrediente. Adaugă primul ingredient!
                                </td>
                            </tr>
                        ) : (
                            ingrediente.map((ing) => (
                                <tr key={ing.id}>
                                    <td>{ing.id}</td>
                                    <td>{ing.name}</td>
                                    <td>{ing.unitateMasura}</td>
                                    <td>{formatPrice(ing.price)}</td>
                                    <td className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(ing)}
                                        >
                                            Editează
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(ing.id)}
                                        >
                                            Șterge
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IngredientePage;