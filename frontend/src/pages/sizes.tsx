import { useEffect, useState } from "react";
import { getSizes, addSize, updateSize, deleteSize, type Size } from "../api/sizes";
import PizzaNav from "../page_related/pizza_navbar.tsx";
import "bootstrap/dist/css/bootstrap.min.css";

function Sizes() {
    const [sizes, setSizes] = useState<Size[]>([]);
    const [editingSize, setEditingSize] = useState<Size | null>(null);
    const [formData, setFormData] = useState({ size: "", base_price: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadSizes = () => {
        getSizes()
            .then(setSizes)
            .catch(console.error);
    };

    useEffect(() => {
        loadSizes();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "base_price" ? value : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const sizeData: Omit<Size, "id"> = {
                size: formData.size,
                base_price: parseFloat(formData.base_price)
            };

            if (editingSize) {
                await updateSize(editingSize.id, { ...editingSize, ...sizeData });
            } else {
                await addSize({ id: 0, ...sizeData });
            }

            // Reset form
            setFormData({ size: "", base_price: "" });
            setEditingSize(null);
            loadSizes();
        } catch (error) {
            console.error("Error saving size:", error);
            alert("Failed to save size. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (size: Size) => {
        setEditingSize(size);
        setFormData({
            size: size.size,
            base_price: size.base_price.toString()
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this size?")) {
            return;
        }

        try {
            await deleteSize(id);
            loadSizes();
        } catch (error) {
            console.error("Error deleting size:", error);
            alert("Failed to delete size. Please try again.");
        }
    };

    const handleCancel = () => {
        setFormData({ size: "", base_price: "" });
        setEditingSize(null);
    };

    return (
        <>
            <div>
                <PizzaNav />
            </div>
            <div className="container my-4">
                <h1 className="mb-4">Sizes Manager</h1>

                {/* Create/Edit Form */}
                <div className="card my-4">
                    <div className="card-header">
                        <h5 className="mb-0">{editingSize ? "Edit Size" : "Add New Size"}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="size" className="form-label">Size Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="size"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Small, Medium, Large"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="base_price" className="form-label">Base Price ($)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="base_price"
                                        name="base_price"
                                        value={formData.base_price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <button
                                    type="submit"
                                    className="btn btn-primary me-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : editingSize ? "Update Size" : "Add Size"}
                                </button>
                                {editingSize && (
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

                {/* Sizes List */}
                <div className="card my-4">
                    <div className="card-header">
                        <h5 className="mb-0">All Sizes</h5>
                    </div>
                    <div className="card-body">
                        {sizes.length === 0 ? (
                            <p className="text-muted">No sizes found. Add your first size above.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Size</th>
                                            <th>Base Price</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sizes.map(size => (
                                            <tr key={size.id}>
                                                <td>{size.id}</td>
                                                <td>{size.size}</td>
                                                <td>${size.base_price.toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEdit(size)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(size.id)}
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

export default Sizes;