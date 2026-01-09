import { useEffect, useState, useRef } from "react";
import { getPizzas, addPizza, updatePizza, deletePizza, type Pizza, type PizzaCreatePayload, type PizzaUpdatePayload } from "../api/pizza.tsx";
import { uploadImage, deleteImage, getImageUrl } from "../api/images.ts";
import { getSizes, type Size } from "../api/sizes.tsx";
import { getSauces, type Sauce } from "../api/sauces.tsx";
import { getCrusts, type Crust } from "../api/crusts.tsx";
import { getToppings, type Topping } from "../api/toppings.tsx";
import PizzaNav from "../page_related/pizza_navbar.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Pizzas() {
    const [pizzas, setPizzas] = useState<Pizza[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [crusts, setCrusts] = useState<Crust[]>([]);
    const [sauces, setSauces] = useState<Sauce[]>([]);
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", image_url: "", is_available: false, toppings: [] as number[], sauce: null as number | null, crust: null as number | null, sizes: [] as number[] });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadPizzas = () => {
        getPizzas()
            .then(setPizzas)
            .catch(console.error);
    };

    const loadSizes = () => {
        getSizes()
            .then(setSizes)
            .catch(console.error);
    };

    const loadCrusts = () => {
        getCrusts()
            .then(setCrusts)
            .catch(console.error);
    };

    const loadSauces = () => {
        getSauces()
            .then(setSauces)
            .catch(console.error);
    };

    const loadToppings = () => {
        getToppings()
            .then(setToppings)
            .catch(console.error);
    };

    useEffect(() => {
        loadPizzas();
        loadSizes();
        loadCrusts();
        loadSauces();
        loadToppings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "is_available" ? value : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let imageUrl = formData.image_url;
            const oldImageUrl = editingPizza?.image_url;

            // Upload new file if one was selected
            if (imageFile) {
                const uploadResult = await uploadImage(imageFile);
                imageUrl = uploadResult.filename; // Use the filename (includes "dist") for database storage
                
                // Delete old image if updating and old image exists
                if (editingPizza && oldImageUrl) {
                    try {
                        await deleteImage(oldImageUrl);
                    } catch (error) {
                        console.error("Error deleting old image:", error);
                        // Continue even if old image deletion fails
                    }
                }
            } else if (editingPizza) {
                // If editing and no new file selected, keep the existing image_url
                imageUrl = oldImageUrl || formData.image_url;
            }

            if (editingPizza) {
                // For updates, only send fields that have changed (partial update)
                const updateData: PizzaUpdatePayload = {
                    name: formData.name,
                    description: formData.description,
                    image_url: imageUrl,
                    is_available: formData.is_available,
                    size_ids: formData.sizes,
                    sauce_id: formData.sauce ?? undefined,
                    crust_id: formData.crust ?? undefined,
                    topping_ids: formData.toppings,
                };
                await updatePizza(editingPizza.id, updateData);
            } else {
                // For creation, send all required fields
                if (!formData.sauce || !formData.crust) {
                    alert("Please select a sauce and crust.");
                    setIsSubmitting(false);
                    return;
                }
                const createData: PizzaCreatePayload = {
                    name: formData.name,
                    description: formData.description,
                    image_url: imageUrl,
                    is_available: formData.is_available,
                    size_ids: formData.sizes,
                    sauce_id: formData.sauce,
                    crust_id: formData.crust,
                    topping_ids: formData.toppings,
                };
                await addPizza(createData);
            }

            // Reset form
            setFormData({ name: "", description: "", image_url: "", is_available: false, toppings: [], sauce: null, crust: null, sizes: [] });
            setImageFile(null);
            setEditingPizza(null);
            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            loadPizzas();
        } catch (error) {
            console.error("Error saving pizza:", error);
            alert("Failed to save pizza. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (pizza: Pizza) => {
        setEditingPizza(pizza);
        setFormData({
            name: pizza.name,
            description: pizza.description,
            image_url: pizza.image_url,
            is_available: pizza.is_available,
            toppings: pizza.toppings.map(t => t.id),
            sauce: pizza.sauce.id,
            crust: pizza.crust.id,
            sizes: pizza.sizes.map(s => s.id),
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this pizza?")) {
            return;
        }

        try {
            await deletePizza(id);
            loadPizzas();
        } catch (error) {
            console.error("Error deleting pizza:", error);
            alert("Failed to delete pizza. Please try again.");
        }
    };

    const handleCancel = () => {
        setFormData({ name: "", description: "", image_url: "", is_available: false, toppings: [], sauce: null, crust: null, sizes: [] });
        setImageFile(null);
        setEditingPizza(null);
        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <>
            <div>
                <PizzaNav />
            </div>
            <div className="container my-4">
                <h1 className="mb-4">Pizzas Manager</h1>

                {/* Create/Edit Form */}
                <div className="card my-4">
                    <div className="card-header">
                        <h5 className="mb-0">{editingPizza ? "Edit Pizza" : "Add New Pizza"}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3 my-2">
                                <div className="col-md-6">
                                    <label htmlFor="name" className="form-label">Pizza Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Margherita Pizza, Pepperoni Pizza"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        placeholder="e.g., for people that like cheese pizza."
                                    />
                                </div>
                            </div>
                            <div className="row g-3 my-2">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <label htmlFor="image_url" className="input-group-text">Image</label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="form-control"
                                            id="image_url"
                                            name="image_url"
                                            accept="image/*"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImageFile(file);
                                                    setFormData({ ...formData, image_url: file.name });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 d-flex justify-content-center align-items-center">
                                    <div style={{ width: "100px", height: "100px" }}>
                                        {imageFile && (
                                            <img className="img-fluid" style={{ width: "100px", height: "100px", objectFit: "cover" }} src={URL.createObjectURL(imageFile)} alt={formData.name || "Preview"} />
                                        )}
                                        {!imageFile && formData.image_url && (
                                            <img className="img-fluid" style={{ width: "100px", height: "100px", objectFit: "cover" }} src={getImageUrl(formData.image_url)} alt={formData.name || "Pizza"} />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="row g-3 my-2">
                                <div className="col-12">
                                    <label className="form-label">Sizes</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {sizes.map(size => (
                                            <div className="form-check" key={size.id}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`size-${size.id}`}
                                                    checked={formData.sizes.includes(size.id)}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, sizes: [...formData.sizes, size.id] });
                                                        } else {
                                                            setFormData({ ...formData, sizes: formData.sizes.filter(id => id !== size.id) });
                                                        }
                                                    }}
                                                />
                                                <label className="form-check-label" htmlFor={`size-${size.id}`}>
                                                    {size.size}
                                                </label>
                                            </div>
                                        ))}
                                        {sizes.length === 0 && (
                                            <p className="text-muted mb-0">
                                                No sizes found. Add some sizes first.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="row g-3 my-2">
                            <div className="col-md-6">
                                    <label htmlFor="crust" className="form-label">Crust</label>
                                    <select 
                                        className="form-select" 
                                        id="crust" 
                                        name="crust" 
                                        value={formData.crust || ""} 
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            setFormData({ ...formData, crust: e.target.value ? parseInt(e.target.value) : null });
                                        }}
                                        required
                                    >
                                        <option value="">Select a crust</option>
                                        {crusts.map(crust => (
                                            <option key={crust.id} value={crust.id}>
                                                {crust.name} - ${crust.price.toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="sauce" className="form-label">Sauce</label>
                                    <select 
                                        className="form-select" 
                                        id="sauce" 
                                        name="sauce" 
                                        value={formData.sauce || ""} 
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            setFormData({ ...formData, sauce: e.target.value ? parseInt(e.target.value) : null });
                                        }}
                                        required
                                    >
                                        <option value="">Select a sauce</option>
                                        {sauces.map(sauce => (
                                            <option key={sauce.id} value={sauce.id}>
                                                {sauce.name} - ${sauce.price.toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row g-3 my-2">
                                <div className="col-12">
                                    <label className="form-label">Toppings</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {toppings.map(topping => (
                                            <div className="form-check" key={topping.id}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`topping-${topping.id}`}
                                                    checked={formData.toppings.includes(topping.id)}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, toppings: [...formData.toppings, topping.id] });
                                                        } else {
                                                            setFormData({ ...formData, toppings: formData.toppings.filter(id => id !== topping.id) });
                                                        }
                                                    }}
                                                />
                                                <label className="form-check-label" htmlFor={`topping-${topping.id}`}>
                                                    {topping.name}
                                                </label>
                                            </div>
                                        ))}
                                        {toppings.length === 0 && (
                                            <p className="text-muted mb-0">
                                                No toppings found. Add some toppings first.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="row g-3 my-2">
                                <div className="col">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_available"
                                            name="is_available"
                                            checked={formData.is_available}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_available: e.target.checked })}
                                        />
                                        <label htmlFor="is_available" className="form-check-label">Is Available</label>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5">
                                <button
                                    type="submit"
                                    className="btn btn-primary me-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : editingPizza ? "Update Pizza" : "Add Pizza"}
                                </button>
                                {editingPizza && (
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

                {/* Sauces List */}
                <div className="card my-4">
                    <div className="card-header">
                        <h5 className="mb-0">All Pizzas</h5>
                    </div>
                    <div className="card-body">
                        {pizzas.length === 0 ? (
                            <p className="text-muted">No pizzas found. Add your first pizza above.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th className="text-center align-middle text-nowrap">ID</th>
                                            <th className="text-center align-middle text-nowrap">Name</th>
                                            <th className="text-center align-middle text-nowrap">Description</th>
                                            <th className="text-center align-middle text-nowrap">Image</th>
                                            <th className="text-center align-middle text-nowrap">Is Available</th>
                                            <th className="text-center align-middle text-nowrap">Sizes</th>
                                            <th className="text-center align-middle text-nowrap">Toppings</th>
                                            <th className="text-center align-middle text-nowrap">Sauce</th>
                                            <th className="text-center align-middle text-nowrap">Crust</th>
                                            <th className="text-center align-middle text-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pizzas.map(pizza => (
                                            <tr key={pizza.id}>
                                                <td>{pizza.id}</td>
                                                <td>{pizza.name}</td>
                                                <td>{pizza.description}</td>
                                                <td><img style={{ width: "100px", height: "100px", objectFit: "cover" }} src={getImageUrl(pizza.image_url)} alt={pizza.name} /></td>
                                                <td className="text-center align-middle">
                                                    {pizza.is_available ? (
                                                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "1.2rem" }}></i>
                                                    ) : (
                                                        <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "1.2rem" }}></i>
                                                    )}
                                                </td>
                                                <td>{pizza.sizes.map(size => size.size).join(", ")}</td>
                                                <td>{pizza.toppings.map(topping => topping.name).join(", ")}</td>
                                                <td>{pizza.sauce.name}</td>
                                                <td>{pizza.crust.name}</td>
                                                <td>
                                                    <div className="d-flex flex-nowrap gap-1">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleEdit(pizza)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(pizza.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
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

export default Pizzas;