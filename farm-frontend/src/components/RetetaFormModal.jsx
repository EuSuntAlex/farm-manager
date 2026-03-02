import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const RetetaFormModal = ({ editMode, currentReteta, onClose, onSave }) => {
    const [ingrediente, setIngrediente] = useState([]);
    const [ingredienteMap, setIngredienteMap] = useState({}); // Map pentru căutare rapidă
    const [formData, setFormData] = useState({
        nume: '',
        descriere: '',
        userId: 1,
        ingrediente: []
    });
    const [currentIngredient, setCurrentIngredient] = useState({
        ingredientId: '',
        cantitate: ''
    });

    // Încarcă ingredientele la montare
    useEffect(() => {
        fetchIngrediente();
    }, []);

    const fetchIngrediente = async () => {
        try {
            const response = await axios.get(`${API_URL}/ingrediente/all?userId=1`);
            setIngrediente(response.data);

            // Creează un map pentru căutare rapidă după ID
            const map = {};
            response.data.forEach(ing => {
                map[ing.id] = ing;
            });
            setIngredienteMap(map);
        } catch (err) {
            console.error('Eroare la încărcarea ingredientelor:', err);
        }
    };

    useEffect(() => {
        if (editMode && currentReteta) {
            setFormData({
                nume: currentReteta.nume,
                descriere: currentReteta.descriere || '',
                userId: 1,
                ingrediente: currentReteta.ingrediente?.map(ing => ({
                    ingredientId: ing.ingredientId,
                    cantitate: ing.cantitate
                })) || []
            });
        }
    }, [editMode, currentReteta]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleIngredientChange = (e) => {
        const { name, value } = e.target;

        // Permite doar numere valide (inclusiv 0 la început)
        if (name === 'cantitate') {
            // Permite șir gol, numere cu punct sau virgulă
            if (value === '' || /^\d*[.,]?\d*$/.test(value)) {
                // Convertim virgula în punct pentru consistență
                const normalizedValue = value.replace(',', '.');
                setCurrentIngredient({
                    ...currentIngredient,
                    [name]: normalizedValue
                });
            }
        } else {
            setCurrentIngredient({
                ...currentIngredient,
                [name]: value
            });
        }
    };

    const addIngredient = () => {
        if (!currentIngredient.ingredientId || !currentIngredient.cantitate) {
            alert('Selectează un ingredient și completează cantitatea!');
            return;
        }

        // Verifică dacă ingredientul există deja în listă
        if (formData.ingrediente.some(ing => ing.ingredientId === currentIngredient.ingredientId)) {
            alert('Acest ingredient există deja în rețetă!');
            return;
        }

        setFormData({
            ...formData,
            ingrediente: [...formData.ingrediente, { ...currentIngredient }]
        });

        setCurrentIngredient({
            ingredientId: '',
            cantitate: ''
        });
    };

    const removeIngredient = (index) => {
        const newIngrediente = formData.ingrediente.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            ingrediente: newIngrediente
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.ingrediente.length === 0) {
            alert('Rețeta trebuie să conțină cel puțin un ingredient!');
            return;
        }

        try {
            if (editMode && currentReteta) {
                await axios.put(
                    `${API_URL}/retete/update/${currentReteta.id}?userId=1`,
                    formData
                );
            } else {
                await axios.post(`${API_URL}/retete/add`, formData);
            }

            onSave();
            onClose();
        } catch (err) {
            if (err.response?.status === 409) {
                alert('Există deja o rețetă cu acest nume!');
            } else {
                alert('Eroare la salvare!');
            }
            console.error(err);
        }
    };

    // Funcții pentru a obține numele și unitatea ingredientului
    const getIngredientName = (id) => {
        return ingredienteMap[id]?.name || 'Se încarcă...';
    };

    const getIngredientUnit = (id) => {
        return ingredienteMap[id]?.unitateMasura || '';
    };

    const getIngredientPrice = (id) => {
        return ingredienteMap[id]?.price || 0;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                <h2>{editMode ? 'Editează Rețetă' : 'Adaugă Rețetă Nouă'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nume Rețetă:</label>
                        <input
                            type="text"
                            name="nume"
                            value={formData.nume}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Descriere:</label>
                        <textarea
                            name="descriere"
                            value={formData.descriere}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    </div>

                    <h3>Ingrediente</h3>

                    {/* Adăugare ingredient */}
                    <div className="ingredient-row">
                        <select
                            name="ingredientId"
                            value={currentIngredient.ingredientId}
                            onChange={handleIngredientChange}
                            className="ingredient-select"
                        >
                            <option value="">Selectează ingredient</option>
                            {ingrediente.map(ing => (
                                <option key={ing.id} value={ing.id}>
                                    {ing.name} ({ing.unitateMasura}) - {ing.price} RON/{ing.unitateMasura}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"  // Schimbat din "number" în "text"
                            name="cantitate"
                            value={currentIngredient.cantitate}
                            onChange={handleIngredientChange}
                            placeholder="Cantitate"
                            inputMode="decimal"  // Pentru tastatură numerică pe mobile
                            pattern="[0-9]*[.,]?[0-9]*"  // Permite numere cu zecimale
                            className="ingredient-cantitate"
                        />

                        <button
                            type="button"
                            className="btn-add-ingredient"
                            onClick={addIngredient}
                        >
                            ➕ Adaugă
                        </button>
                    </div>

                    {/* Lista ingredientelor adăugate */}
                    {formData.ingrediente.length > 0 && (
                        <table className="ingrediente-lista">
                            <thead>
                                <tr>
                                    <th>Ingredient</th>
                                    <th>Cantitate</th>
                                    <th>UM</th>
                                    <th>Preț</th>
                                    <th>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.ingrediente.map((ing, index) => {
                                    const nume = getIngredientName(ing.ingredientId);
                                    const unitate = getIngredientUnit(ing.ingredientId);
                                    const pret = getIngredientPrice(ing.ingredientId);
                                    const pretTotal = (pret * ing.cantitate).toFixed(2);

                                    return (
                                        <tr key={index}>
                                            <td>{nume}</td>
                                            <td>{ing.cantitate}</td>
                                            <td>{unitate}</td>
                                            <td>{pretTotal} RON</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn-remove"
                                                    onClick={() => removeIngredient(index)}
                                                >
                                                    ✖
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="btn-success">
                            {editMode ? 'Actualizează' : 'Salvează'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Anulează
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RetetaFormModal;