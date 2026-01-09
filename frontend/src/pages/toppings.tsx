import { useEffect, useState } from "react";
import { getToppings, addTopping, updateTopping, deleteTopping, type Topping, type ToppingCreatePayload } from "../api/toppings.tsx";
import { getToppingCategories, type ToppingCategory } from "../api/topping_categories.tsx";
import PizzaNav from "../page_related/pizza_navbar.tsx";
import "bootstrap/dist/css/bootstrap.min.css";

function Toppings() {
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [editingTopping, setEditingTopping] = useState<Topping | null>(null);
    const [formData, setFormData] = useState({ name: "", price: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<ToppingCategory[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

    const loadToppings = () => {
        getToppings()
            .then(setToppings)
            .catch(console.error);
    };

    const loadCategories = () => {
        getToppingCategories()
            .then(setCategories)
            .catch(console.error);
    };

    useEffect(() => {
        loadToppings();
        loadCategories();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "price" ? value : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const toppingData: ToppingCreatePayload = {
                name: formData.name,
                price: parseFloat(formData.price),
                category_ids: selectedCategoryIds,
            };

            if (editingTopping) {
                await updateTopping(editingTopping.id, toppingData);
            } else {
                await addTopping(toppingData);
            }

            // Reset form
            setFormData({ name: "", price: "" });
            setEditingTopping(null);
            setSelectedCategoryIds([]);
            loadToppings();
        } catch (error) {
            console.error("Error saving topping:", error);
            alert("Failed to save topping. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (topping: Topping) => {
        setEditingTopping(topping);
        setFormData({
            name: topping.name,
            price: topping.price.toString()
        });
        setSelectedCategoryIds(topping.categories?.map(c => c.id) ?? []);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this topping?")) {
            return;
        }

        try {
            console.log("Deleting topping:", id);
            await deleteTopping(id);
            loadToppings();
        } catch (error) {
            console.error("Error deleting topping:", error);
            alert("Failed to delete topping. Please try again.");
        }
    };

    const handleCancel = () => {
        setFormData({ name: "", price: "" });
        setEditingTopping(null);
        setSelectedCategoryIds([]);
    };

    const toggleCategorySelection = (categoryId: number) => {
        setSelectedCategoryIds(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <>
            <div>
                <PizzaNav />
            </div>
            <div className="container mt-4">
                <h1 className="mb-4">Toppings Manager</h1>

                {/* Create/Edit Form */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">{editingTopping ? "Edit Topping" : "Add New Topping"}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="name" className="form-label">Topping Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Tomato Sauce, Alfredo Sauce"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="price" className="form-label">Price ($)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Categories</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {categories.map(category => (
                                            <div className="form-check form-check-inline" key={category.id}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`cat-${category.id}`}
                                                    checked={selectedCategoryIds.includes(category.id)}
                                                    onChange={() => toggleCategorySelection(category.id)}
                                                />
                                                <label className="form-check-label" htmlFor={`cat-${category.id}`}>
                                                    {category.name}
                                                </label>
                                            </div>
                                        ))}
                                        {categories.length === 0 && (
                                            <p className="text-muted mb-0">
                                                No categories found. Add some topping categories first.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <button
                                    type="submit"
                                    className="btn btn-primary me-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : editingTopping ? "Update Topping" : "Add Topping"}
                                </button>
                                {editingTopping && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Toppings List */}
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">All Toppings</h5>
                    </div>
                    <div className="card-body">
                        {toppings.length === 0 ? (
                            <p className="text-muted">No toppings found. Add your first topping above.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Topping</th>
                                            <th>Price</th>
                                            <th>Categories</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {toppings.map(topping => (
                                            <tr key={topping.id}>
                                                <td>{topping.id}</td>
                                                <td>{topping.name}</td>
                                                <td>${topping.price.toFixed(2)}</td>
                                                <td>
                                                    {topping.categories && topping.categories.length > 0 ? (
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {topping.categories.map(category => (
                                                                <span key={category.id} className="badge bg-secondary">
                                                                    {category.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">None</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEdit(topping)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(topping.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Toppings;