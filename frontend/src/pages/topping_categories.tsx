import { useEffect, useState } from "react";
import { getToppingCategories, addToppingCategory, updateToppingCategory, deleteToppingCategory, type ToppingCategory } from "../api/topping_categories.tsx";
import PizzaNav from "../page_related/pizza_navbar.tsx";
import "bootstrap/dist/css/bootstrap.min.css";

function ToppingCategories() {
    const [toppingCategories, setToppingCategories] = useState<ToppingCategory[]>([]);
    const [editingToppingCategory, setEditingToppingCategory] = useState<ToppingCategory | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadToppingCategories = () => {
        getToppingCategories()
            .then(setToppingCategories)
            .catch(console.error);
    };

    useEffect(() => {
        loadToppingCategories();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const toppingCategoryData: Omit<ToppingCategory, "id"> = {
                name: formData.name,
                description: formData.description
            };

            if (editingToppingCategory) {
                await updateToppingCategory(editingToppingCategory.id, { ...editingToppingCategory, ...toppingCategoryData });
            } else {
                await addToppingCategory({ id: 0, ...toppingCategoryData });
            }

            // Reset form
            setFormData({ name: "", description: "" });
            setEditingToppingCategory(null);
            loadToppingCategories();
        } catch (error) {
            console.error("Error saving topping category:", error);
            alert("Failed to save topping category. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (toppingCategory: ToppingCategory) => {
        setEditingToppingCategory(toppingCategory);
        setFormData({
            name: toppingCategory.name,
            description: toppingCategory.description
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this topping category?")) {
            return;
        }

        try {
            await deleteToppingCategory(id);
            loadToppingCategories();
        } catch (error) {
            console.error("Error deleting topping category:", error);
            alert("Failed to delete topping category. Please try again.");
        }
    };

    const handleCancel = () => {
        setFormData({ name: "", description: "" });
        setEditingToppingCategory(null);
    };

    return (
        <>
            <div>
                <PizzaNav />
            </div>
            <div className="container my-4">
                <h1 className="mb-4">Topping Categories Manager</h1>

                {/* Create/Edit Form */}
                <div className="card my-4">
                    <div className="card-header">
                        <h5 className="mb-0">{editingToppingCategory ? "Edit Topping Category" : "Add New Topping Category"}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="name" className="form-label">Topping Category Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Cheese, Meat, Veggie"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={3}
                                        placeholder="e.g., Cheese is a dairy product that is used to make pizza."
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <button
                                    type="submit"
                                    className="btn btn-primary me-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : editingToppingCategory ? "Update Topping Category" : "Add Topping Category"}
                                </button>
                                {editingToppingCategory && (
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

                {/* Topping Categories List */}
                <div className="card my-4">
                    <div className="card-header">
                        <h5 className="mb-0">All Topping Categories</h5>
                    </div>
                    <div className="card-body">
                        {toppingCategories.length === 0 ? (
                            <p className="text-muted">No topping categories found. Add your first topping category above.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Topping Category</th>
                                            <th>Description</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {toppingCategories.map(toppingCategory => (
                                            <tr key={toppingCategory.id}>
                                                <td>{toppingCategory.id}</td>
                                                <td>{toppingCategory.name}</td>
                                                <td>{toppingCategory.description}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEdit(toppingCategory)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(toppingCategory.id)}
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

export default ToppingCategories;