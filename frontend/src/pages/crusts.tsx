import { useEffect, useState } from "react";
import { getCrusts, addCrust, updateCrust, deleteCrust, type Crust } from "../api/crusts.tsx";
import PizzaNav from "../page_related/pizza_navbar.tsx";
import "bootstrap/dist/css/bootstrap.min.css";

function Crusts() {
    const [crusts, setCrusts] = useState<Crust[]>([]);
    const [editingCrust, setEditingCrust] = useState<Crust | null>(null);
    const [formData, setFormData] = useState({ name: "", price: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadCrusts = () => {
        getCrusts()
            .then(setCrusts)
            .catch(console.error);
    };

    useEffect(() => {
        loadCrusts();
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
            const crustData: Omit<Crust, "id"> = {
                name: formData.name,
                price: parseFloat(formData.price)
            };

            if (editingCrust) {
                await updateCrust(editingCrust.id, { ...editingCrust, ...crustData });
            } else {
                await addCrust({ id: 0, ...crustData });
            }

            // Reset form
            setFormData({ name: "", price: "" });
            setEditingCrust(null);
            loadCrusts();
        } catch (error) {
            console.error("Error saving crust:", error);
            alert("Failed to save crust. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (crust: Crust) => {
        setEditingCrust(crust);
        setFormData({
            name: crust.name,
            price: crust.price.toString()
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this crust?")) {
            return;
        }

        try {
            console.log("Deleting crust:", id);
            await deleteCrust(id);
            loadCrusts();
        } catch (error) {
            console.error("Error deleting crust:", error);
            alert("Failed to delete crust. Please try again.");
        }
    };

    const handleCancel = () => {
        setFormData({ name: "", price: "" });
        setEditingCrust(null);
    };

    return (
        <>
            <div>
                <PizzaNav />
            </div>
            <div className="container mt-4">
                <h1 className="mb-4">Crusts Manager</h1>

                {/* Create/Edit Form */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">{editingCrust ? "Edit Crust" : "Add New Crust"}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="name" className="form-label">Crust Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Thin Crust, Thick Crust"
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
                            </div>
                            <div className="mt-3">
                                <button
                                    type="submit"
                                    className="btn btn-primary me-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : editingCrust ? "Update Crust" : "Add Crust"}
                                </button>
                                {editingCrust && (
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

                {/* Crusts List */}
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">All Crusts</h5>
                    </div>
                    <div className="card-body">
                        {crusts.length === 0 ? (
                            <p className="text-muted">No crusts found. Add your first crust above.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Crust</th>
                                            <th>Price</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {crusts.map(crust => (
                                            <tr key={crust.id}>
                                                <td>{crust.id}</td>
                                                <td>{crust.name}</td>
                                                <td>${crust.price.toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEdit(crust)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(crust.id)}
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

export default Crusts;