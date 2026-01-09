from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from typing import List
import logging
import os
import shutil
from pathlib import Path
from pizza_app.database import get_db

# Set up logger
logger = logging.getLogger(__name__)
from pizza_app.models.pizza_models import (
    Pizza as PizzaModel, 
    Size as SizeModel, 
    Sauce as SauceModel, 
    Crust as CrustModel, 
    Topping as ToppingModel, 
    ToppingCategory as ToppingCategoryModel,
    topping_categories
)
from pizza_app.models.pizza_schemas import (
    Pizza, Size, Sauce, Crust, Topping, ToppingCategory,
    PizzaCreate, PizzaUpdate, SizeCreate, SizeUpdate, SauceCreate, SauceUpdate,
    CrustCreate, CrustUpdate, ToppingCreate, ToppingUpdate,
    ToppingCategoryCreate, ToppingCategoryUpdate
)

router = APIRouter(prefix="/pizza", tags=["pizza"])

################################################################################
# GET requests
################################################################################

@router.get("/get_designer_pizzas", response_model=List[Pizza])
async def get_designer_pizzas(db: Session = Depends(get_db)):
    """Get all designer pizzas"""
    pizzas = db.query(PizzaModel).all()
    return pizzas

@router.get("/get_designer_pizza/{pizza_id}", response_model=Pizza)
async def get_designer_pizza(pizza_id: int, db: Session = Depends(get_db)):
    """Get a specific designer pizza by ID"""
    pizza = db.query(PizzaModel).filter(PizzaModel.id == pizza_id).first()
    if not pizza:
        raise HTTPException(status_code=404, detail="Pizza not found")
    return pizza

@router.get("/get_pizza_sizes", response_model=List[Size])
async def get_pizza_sizes(db: Session = Depends(get_db)):
    """Get all pizza sizes"""
    sizes = db.query(SizeModel).all()
    return sizes

@router.get("/get_pizza_size/{size_id}", response_model=Size)
async def get_pizza_size(size_id: int, db: Session = Depends(get_db)):
    """Get a specific pizza size by ID"""
    size = db.query(SizeModel).filter(SizeModel.id == size_id).first()
    if not size:
        raise HTTPException(status_code=404, detail="Size not found")
    return size

@router.get("/get_pizza_sauces", response_model=List[Sauce])
async def get_pizza_sauces(db: Session = Depends(get_db)):
    """Get all pizza sauces"""
    sauces = db.query(SauceModel).all()
    return sauces

@router.get("/get_pizza_sauce/{sauce_id}", response_model=Sauce)
async def get_pizza_sauce(sauce_id: int, db: Session = Depends(get_db)):
    """Get a specific pizza sauce by ID"""
    sauce = db.query(SauceModel).filter(SauceModel.id == sauce_id).first()
    if not sauce:
        raise HTTPException(status_code=404, detail="Sauce not found")
    return sauce

@router.get("/get_pizza_crusts", response_model=List[Crust])
async def get_pizza_crusts(db: Session = Depends(get_db)):
    """Get all pizza crusts"""
    crusts = db.query(CrustModel).all()
    return crusts

@router.get("/get_pizza_crust/{crust_id}", response_model=Crust)
async def get_pizza_crust(crust_id: int, db: Session = Depends(get_db)):
    """Get a specific pizza crust by ID"""
    crust = db.query(CrustModel).filter(CrustModel.id == crust_id).first()
    if not crust:
        raise HTTPException(status_code=404, detail="Crust not found")
    return crust

@router.get("/get_pizza_toppings", response_model=List[Topping])
async def get_pizza_toppings(db: Session = Depends(get_db)):
    """Get all pizza toppings, ordered by their first category name (alphabetically)"""
    
    # Subquery to get the minimum (first alphabetically) category name for each topping
    # This allows us to group/order toppings by their primary category
    min_category_name = (
        select(func.min(ToppingCategoryModel.name))
        .select_from(ToppingCategoryModel)
        .join(
            topping_categories,
            ToppingCategoryModel.id == topping_categories.c.category_id
        )
        .where(topping_categories.c.topping_id == ToppingModel.id)
        .correlate(ToppingModel)
        .scalar_subquery()
    )
    
    # Query toppings ordered by their first category name, then by topping name
    # nulls_last() ensures toppings without categories appear at the end
    toppings = (
        db.query(ToppingModel)
        .order_by(min_category_name.nulls_last(), ToppingModel.name)
        .all()
    )
    
    return toppings

@router.get("/get_pizza_topping/{topping_id}", response_model=Topping)
async def get_pizza_topping(topping_id: int, db: Session = Depends(get_db)):
    """Get a specific pizza topping by ID"""
    topping = db.query(ToppingModel).filter(ToppingModel.id == topping_id).first()
    if not topping:
        raise HTTPException(status_code=404, detail="Topping not found")
    return topping

@router.get("/get_pizza_topping_categories", response_model=List[ToppingCategory])
async def get_pizza_topping_categories(db: Session = Depends(get_db)):
    """Get all topping categories"""
    categories = db.query(ToppingCategoryModel).all()
    return categories

@router.get("/get_pizza_topping_category/{category_id}", response_model=ToppingCategory)
async def get_pizza_topping_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific pizza topping category by ID"""
    category = db.query(ToppingCategoryModel).filter(ToppingCategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Topping category not found")
    return category

@router.get("/{pizza_id}", response_model=Pizza)
async def get_pizza(pizza_id: int, db: Session = Depends(get_db)):
    """Get a specific pizza by ID"""
    pizza = db.query(PizzaModel).filter(PizzaModel.id == pizza_id).first()
    if not pizza:
        raise HTTPException(status_code=404, detail="Pizza not found")
    return pizza

################################################################################
# POST requests
################################################################################

@router.post("/add_size", response_model=Size, status_code=201)
async def add_size(size: SizeCreate, db: Session = Depends(get_db)):
    """Add a new pizza size"""
    # Use model_dump() for Pydantic v2, fallback to dict() for v1
    size_data = size.model_dump() if hasattr(size, 'model_dump') else size.dict()
    db_size = SizeModel(**size_data)
    db.add(db_size)
    db.commit()
    db.refresh(db_size)
    return db_size

@router.post("/add_sauce", response_model=Sauce, status_code=201)
async def add_sauce(sauce: SauceCreate, db: Session = Depends(get_db)):
    """Add a new sauce"""
    # Use model_dump() for Pydantic v2, fallback to dict() for v1
    sauce_data = sauce.model_dump() if hasattr(sauce, 'model_dump') else sauce.dict()
    db_sauce = SauceModel(**sauce_data)
    db.add(db_sauce)
    db.commit()
    db.refresh(db_sauce)
    return db_sauce

@router.post("/add_crust", response_model=Crust, status_code=201)
async def add_crust(crust: CrustCreate, db: Session = Depends(get_db)):
    """Add a new crust"""
    # Use model_dump() for Pydantic v2, fallback to dict() for v1
    crust_data = crust.model_dump() if hasattr(crust, 'model_dump') else crust.dict()
    db_crust = CrustModel(**crust_data)
    db.add(db_crust)
    db.commit()
    db.refresh(db_crust)
    return db_crust

@router.post("/add_topping", response_model=Topping, status_code=201)
async def add_topping(topping: ToppingCreate, db: Session = Depends(get_db)):
    """Add a new topping"""
    # Validate that all category IDs exist
    categories = db.query(ToppingCategoryModel).filter(
        ToppingCategoryModel.id.in_(topping.category_ids)
    ).all()
    
    if len(categories) != len(topping.category_ids):
        found_ids = {cat.id for cat in categories}
        missing_ids = set(topping.category_ids) - found_ids
        raise HTTPException(
            status_code=404, 
            detail=f"Topping category IDs not found: {list(missing_ids)}"
        )
    
    db_topping = ToppingModel(
        name=topping.name,
        price=topping.price
    )
    db_topping.categories = categories
    db.add(db_topping)
    db.commit()
    db.refresh(db_topping)
    return db_topping

@router.post("/add_pizza_topping_category", response_model=ToppingCategory, status_code=201)
async def add_pizza_topping_category(
    topping_category: ToppingCategoryCreate, 
    db: Session = Depends(get_db)
):
    """Add a new topping category"""
    # Use model_dump() for Pydantic v2, fallback to dict() for v1
    category_data = topping_category.model_dump() if hasattr(topping_category, 'model_dump') else topping_category.dict()
    db_category = ToppingCategoryModel(**category_data)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.post("/add_pizza", response_model=Pizza, status_code=201)
async def add_pizza(pizza: PizzaCreate, db: Session = Depends(get_db)):
    """Add a new designer pizza"""
    # Validate all related objects exist
    sizes = db.query(SizeModel).filter(SizeModel.id.in_(pizza.size_ids)).all()
    if len(sizes) != len(pizza.size_ids):
        found_ids = {s.id for s in sizes}
        missing_ids = set(pizza.size_ids) - found_ids
        raise HTTPException(
            status_code=404, 
            detail=f"Size IDs not found: {list(missing_ids)}"
        )
    
    sauce = db.query(SauceModel).filter(SauceModel.id == pizza.sauce_id).first()
    if not sauce:
        raise HTTPException(status_code=404, detail=f"Sauce ID {pizza.sauce_id} not found")
    
    crust = db.query(CrustModel).filter(CrustModel.id == pizza.crust_id).first()
    if not crust:
        raise HTTPException(status_code=404, detail=f"Crust ID {pizza.crust_id} not found")
    
    toppings = db.query(ToppingModel).filter(ToppingModel.id.in_(pizza.topping_ids)).all()
    if len(toppings) != len(pizza.topping_ids):
        found_ids = {t.id for t in toppings}
        missing_ids = set(pizza.topping_ids) - found_ids
        raise HTTPException(
            status_code=404, 
            detail=f"Topping IDs not found: {list(missing_ids)}"
        )
    
    db_pizza = PizzaModel(
        name=pizza.name,
        description=pizza.description,
        image_url=pizza.image_url,
        is_available=pizza.is_available,
        sauce_id=sauce.id,
        crust_id=crust.id
    )
    db_pizza.sizes = sizes
    db_pizza.toppings = toppings
    
    db.add(db_pizza)
    db.commit()
    db.refresh(db_pizza)
    return db_pizza

################################################################################
# PUT/PATCH requests (Updates)
################################################################################

@router.patch("/update_pizza/{pizza_id}", response_model=Pizza)
async def update_pizza(
    pizza_id: int, 
    pizza_update: PizzaUpdate, 
    db: Session = Depends(get_db)
):
    """Partially update an existing pizza - only provided fields will be updated"""
    db_pizza = db.query(PizzaModel).filter(PizzaModel.id == pizza_id).first()
    if not db_pizza:
        raise HTTPException(status_code=404, detail="Pizza not found")
    
    # Get update data, excluding None values
    update_data = pizza_update.model_dump(exclude_unset=True) if hasattr(pizza_update, 'model_dump') else {
        k: v for k, v in pizza_update.dict().items() if v is not None
    }
    
    # Update simple fields if provided
    if "name" in update_data:
        db_pizza.name = update_data["name"]
    if "description" in update_data:
        db_pizza.description = update_data["description"]
    if "image_url" in update_data:
        db_pizza.image_url = update_data["image_url"]
    if "is_available" in update_data:
        db_pizza.is_available = update_data["is_available"]
    
    # Update sauce if provided
    if "sauce_id" in update_data:
        sauce = db.query(SauceModel).filter(SauceModel.id == update_data["sauce_id"]).first()
        if not sauce:
            raise HTTPException(
                status_code=404, 
                detail=f"Sauce ID {update_data['sauce_id']} not found"
            )
        db_pizza.sauce_id = sauce.id
    
    # Update crust if provided
    if "crust_id" in update_data:
        crust = db.query(CrustModel).filter(CrustModel.id == update_data["crust_id"]).first()
        if not crust:
            raise HTTPException(
                status_code=404, 
                detail=f"Crust ID {update_data['crust_id']} not found"
            )
        db_pizza.crust_id = crust.id
    
    # Update sizes if provided
    if "size_ids" in update_data:
        sizes = db.query(SizeModel).filter(SizeModel.id.in_(update_data["size_ids"])).all()
        if len(sizes) != len(update_data["size_ids"]):
            found_ids = {s.id for s in sizes}
            missing_ids = set(update_data["size_ids"]) - found_ids
            raise HTTPException(
                status_code=404, 
                detail=f"Size IDs not found: {list(missing_ids)}"
            )
        db_pizza.sizes = sizes
    
    # Update toppings if provided
    if "topping_ids" in update_data:
        toppings = db.query(ToppingModel).filter(ToppingModel.id.in_(update_data["topping_ids"])).all()
        if len(toppings) != len(update_data["topping_ids"]):
            found_ids = {t.id for t in toppings}
            missing_ids = set(update_data["topping_ids"]) - found_ids
            raise HTTPException(
                status_code=404, 
                detail=f"Topping IDs not found: {list(missing_ids)}"
            )
        db_pizza.toppings = toppings
    
    db.commit()
    db.refresh(db_pizza)
    return db_pizza

@router.put("/update_pizza/{pizza_id}", response_model=Pizza)
async def update_pizza_full(
    pizza_id: int, 
    pizza: PizzaCreate, 
    db: Session = Depends(get_db)
):
    """
    Fully update an existing pizza - all fields required.
    
    NOTE: For partial updates (e.g., just changing sauce_id), use PATCH instead of PUT.
    PUT requires: name, description, image_url, is_available, size_ids, sauce_id, crust_id, topping_ids
    """
    db_pizza = db.query(PizzaModel).filter(PizzaModel.id == pizza_id).first()
    if not db_pizza:
        raise HTTPException(status_code=404, detail="Pizza not found")
    
    # Validate all related objects exist
    sizes = db.query(SizeModel).filter(SizeModel.id.in_(pizza.size_ids)).all()
    if len(sizes) != len(pizza.size_ids):
        found_ids = {s.id for s in sizes}
        missing_ids = set(pizza.size_ids) - found_ids
        raise HTTPException(
            status_code=404, 
            detail=f"Size IDs not found: {list(missing_ids)}"
        )
    
    sauce = db.query(SauceModel).filter(SauceModel.id == pizza.sauce_id).first()
    if not sauce:
        raise HTTPException(status_code=404, detail=f"Sauce ID {pizza.sauce_id} not found")
    
    crust = db.query(CrustModel).filter(CrustModel.id == pizza.crust_id).first()
    if not crust:
        raise HTTPException(status_code=404, detail=f"Crust ID {pizza.crust_id} not found")
    
    toppings = db.query(ToppingModel).filter(ToppingModel.id.in_(pizza.topping_ids)).all()
    if len(toppings) != len(pizza.topping_ids):
        found_ids = {t.id for t in toppings}
        missing_ids = set(pizza.topping_ids) - found_ids
        raise HTTPException(
            status_code=404, 
            detail=f"Topping IDs not found: {list(missing_ids)}"
        )
    
    # Update all pizza fields
    db_pizza.name = pizza.name
    db_pizza.description = pizza.description
    db_pizza.image_url = pizza.image_url
    db_pizza.is_available = pizza.is_available
    db_pizza.sauce_id = sauce.id
    db_pizza.crust_id = crust.id
    db_pizza.sizes = sizes
    db_pizza.toppings = toppings
    
    db.commit()
    db.refresh(db_pizza)
    return db_pizza

# Size Updates
@router.patch("/update_size/{size_id}", response_model=Size)
async def update_size(
    size_id: int,
    size_update: SizeUpdate,
    db: Session = Depends(get_db)
):
    """Partially update a size - only provided fields will be updated"""
    db_size = db.query(SizeModel).filter(SizeModel.id == size_id).first()
    if not db_size:
        raise HTTPException(status_code=404, detail="Size not found")
    
    update_data = size_update.model_dump(exclude_unset=True) if hasattr(size_update, 'model_dump') else {
        k: v for k, v in size_update.dict().items() if v is not None
    }
    
    if "size" in update_data:
        db_size.size = update_data["size"]
    if "base_price" in update_data:
        db_size.base_price = update_data["base_price"]
    
    db.commit()
    db.refresh(db_size)
    return db_size

@router.put("/update_size/{size_id}", response_model=Size)
async def update_size_full(
    size_id: int,
    size: SizeCreate,
    db: Session = Depends(get_db)
):
    """Fully update a size - all fields required"""
    db_size = db.query(SizeModel).filter(SizeModel.id == size_id).first()
    if not db_size:
        raise HTTPException(status_code=404, detail="Size not found")
    
    size_data = size.model_dump() if hasattr(size, 'model_dump') else size.dict()
    for key, value in size_data.items():
        setattr(db_size, key, value)
    
    db.commit()
    db.refresh(db_size)
    return db_size

# Sauce Updates
@router.patch("/update_sauce/{sauce_id}", response_model=Sauce)
async def update_sauce(
    sauce_id: int,
    sauce_update: SauceUpdate,
    db: Session = Depends(get_db)
):
    """Partially update a sauce - only provided fields will be updated"""
    db_sauce = db.query(SauceModel).filter(SauceModel.id == sauce_id).first()
    if not db_sauce:
        raise HTTPException(status_code=404, detail="Sauce not found")
    
    update_data = sauce_update.model_dump(exclude_unset=True) if hasattr(sauce_update, 'model_dump') else {
        k: v for k, v in sauce_update.dict().items() if v is not None
    }
    
    if "name" in update_data:
        db_sauce.name = update_data["name"]
    if "price" in update_data:
        db_sauce.price = update_data["price"]
    
    db.commit()
    db.refresh(db_sauce)
    return db_sauce

@router.put("/update_sauce/{sauce_id}", response_model=Sauce)
async def update_sauce_full(
    sauce_id: int,
    sauce: SauceCreate,
    db: Session = Depends(get_db)
):
    """Fully update a sauce - all fields required"""
    db_sauce = db.query(SauceModel).filter(SauceModel.id == sauce_id).first()
    if not db_sauce:
        raise HTTPException(status_code=404, detail="Sauce not found")
    
    sauce_data = sauce.model_dump() if hasattr(sauce, 'model_dump') else sauce.dict()
    for key, value in sauce_data.items():
        setattr(db_sauce, key, value)
    
    db.commit()
    db.refresh(db_sauce)
    return db_sauce

# Crust Updates
@router.patch("/update_crust/{crust_id}", response_model=Crust)
async def update_crust(
    crust_id: int,
    crust_update: CrustUpdate,
    db: Session = Depends(get_db)
):
    """Partially update a crust - only provided fields will be updated"""
    db_crust = db.query(CrustModel).filter(CrustModel.id == crust_id).first()
    if not db_crust:
        raise HTTPException(status_code=404, detail="Crust not found")
    
    update_data = crust_update.model_dump(exclude_unset=True) if hasattr(crust_update, 'model_dump') else {
        k: v for k, v in crust_update.dict().items() if v is not None
    }
    
    if "name" in update_data:
        db_crust.name = update_data["name"]
    if "price" in update_data:
        db_crust.price = update_data["price"]
    
    db.commit()
    db.refresh(db_crust)
    return db_crust

@router.put("/update_crust/{crust_id}", response_model=Crust)
async def update_crust_full(
    crust_id: int,
    crust: CrustCreate,
    db: Session = Depends(get_db)
):
    """Fully update a crust - all fields required"""
    db_crust = db.query(CrustModel).filter(CrustModel.id == crust_id).first()
    if not db_crust:
        raise HTTPException(status_code=404, detail="Crust not found")
    
    crust_data = crust.model_dump() if hasattr(crust, 'model_dump') else crust.dict()
    for key, value in crust_data.items():
        setattr(db_crust, key, value)
    
    db.commit()
    db.refresh(db_crust)
    return db_crust

# Topping Category Updates
@router.patch("/update_pizza_topping_category/{category_id}", response_model=ToppingCategory)
async def update_pizza_topping_category(
    category_id: int,
    category_update: ToppingCategoryUpdate,
    db: Session = Depends(get_db)
):
    """Partially update a topping category - only provided fields will be updated"""
    db_category = db.query(ToppingCategoryModel).filter(ToppingCategoryModel.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Topping category not found")
    
    update_data = category_update.model_dump(exclude_unset=True) if hasattr(category_update, 'model_dump') else {
        k: v for k, v in category_update.dict().items() if v is not None
    }
    
    if "name" in update_data:
        db_category.name = update_data["name"]
    if "description" in update_data:
        db_category.description = update_data["description"]
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/update_pizza_topping_category/{category_id}", response_model=ToppingCategory)
async def update_pizza_topping_category_full(
    category_id: int,
    category: ToppingCategoryCreate,
    db: Session = Depends(get_db)
):
    """Fully update a topping category - all fields required"""
    db_category = db.query(ToppingCategoryModel).filter(ToppingCategoryModel.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Topping category not found")
    
    category_data = category.model_dump() if hasattr(category, 'model_dump') else category.dict()
    for key, value in category_data.items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

# Topping Updates
@router.patch("/update_topping/{topping_id}", response_model=Topping)
async def update_topping(
    topping_id: int,
    topping_update: ToppingUpdate,
    db: Session = Depends(get_db)
):
    """Partially update a topping - only provided fields will be updated"""
    db_topping = db.query(ToppingModel).filter(ToppingModel.id == topping_id).first()
    if not db_topping:
        raise HTTPException(status_code=404, detail="Topping not found")
    
    update_data = topping_update.model_dump(exclude_unset=True) if hasattr(topping_update, 'model_dump') else {
        k: v for k, v in topping_update.dict().items() if v is not None
    }
    
    if "name" in update_data:
        db_topping.name = update_data["name"]
    if "price" in update_data:
        db_topping.price = update_data["price"]
    if "category_ids" in update_data:
        categories = db.query(ToppingCategoryModel).filter(
            ToppingCategoryModel.id.in_(update_data["category_ids"])
        ).all()
        if len(categories) != len(update_data["category_ids"]):
            found_ids = {cat.id for cat in categories}
            missing_ids = set(update_data["category_ids"]) - found_ids
            raise HTTPException(
                status_code=404,
                detail=f"Topping category IDs not found: {list(missing_ids)}"
            )
        db_topping.categories = categories
    
    db.commit()
    db.refresh(db_topping)
    return db_topping

@router.put("/update_topping/{topping_id}", response_model=Topping)
async def update_topping_full(
    topping_id: int,
    topping: ToppingCreate,
    db: Session = Depends(get_db)
):
    """Fully update a topping - all fields required"""
    db_topping = db.query(ToppingModel).filter(ToppingModel.id == topping_id).first()
    if not db_topping:
        raise HTTPException(status_code=404, detail="Topping not found")
    
    # Validate categories exist
    categories = db.query(ToppingCategoryModel).filter(
        ToppingCategoryModel.id.in_(topping.category_ids)
    ).all()
    if len(categories) != len(topping.category_ids):
        found_ids = {cat.id for cat in categories}
        missing_ids = set(topping.category_ids) - found_ids
        raise HTTPException(
            status_code=404,
            detail=f"Topping category IDs not found: {list(missing_ids)}"
        )
    
    db_topping.name = topping.name
    db_topping.price = topping.price
    db_topping.categories = categories
    
    db.commit()
    db.refresh(db_topping)
    return db_topping

################################################################################
# FILE UPLOAD/DELETE requests
################################################################################

# Path to images directory (relative to project root)
# From backend/pizza_app/router/, go up 3 levels to project root
IMAGES_DIR = Path(__file__).parent.parent.parent.parent / "frontend" / "dist" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload_image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file to the images directory"""
    try:
        # Generate a unique filename to avoid conflicts
        import uuid
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = IMAGES_DIR / unique_filename
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the relative path that will be used in the frontend
        # filename includes "dist" for database storage, path is the URL path
        return JSONResponse(content={"filename": f"dist/images/{unique_filename}", "path": f"/images/{unique_filename}"})
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.delete("/delete_image/{filename:path}")
async def delete_image(filename: str):
    """Delete an image file from the images directory"""
    try:
        # Remove various path prefixes if present
        if filename.startswith("dist/images/"):
            filename = filename[13:]  # Remove "dist/images/"
        elif filename.startswith("/dist/images/"):
            filename = filename[14:]  # Remove "/dist/images/"
        elif filename.startswith("images/"):
            filename = filename[7:]  # Remove "images/"
        elif filename.startswith("/images/"):
            filename = filename[8:]  # Remove "/images/"
        
        file_path = IMAGES_DIR / filename
        
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
            return JSONResponse(content={"message": "File deleted successfully"})
        else:
            raise HTTPException(status_code=404, detail="File not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

################################################################################
# DELETE requests
################################################################################

@router.delete("/delete_pizza/{pizza_id}", status_code=204)
async def delete_pizza(pizza_id: int, db: Session = Depends(get_db)):
    """Delete a pizza and its associated image file"""
    pizza = db.query(PizzaModel).filter(PizzaModel.id == pizza_id).first()
    if not pizza:
        raise HTTPException(status_code=404, detail="Pizza not found")
    
    # Delete the image file if it exists
    if pizza.image_url:
        try:
            # Extract filename from image_url
            filename = pizza.image_url
            if filename.startswith("dist/images/"):
                filename = filename[13:]  # Remove "dist/images/"
            elif filename.startswith("/dist/images/"):
                filename = filename[14:]  # Remove "/dist/images/"
            elif filename.startswith("images/"):
                filename = filename[7:]  # Remove "images/"
            elif filename.startswith("/images/"):
                filename = filename[8:]  # Remove "/images/"
            
            file_path = IMAGES_DIR / filename
            if file_path.exists() and file_path.is_file():
                file_path.unlink()
                logger.info(f"Deleted image file: {file_path}")
        except Exception as e:
            logger.error(f"Error deleting image file for pizza {pizza_id}: {e}")
            # Continue with pizza deletion even if image deletion fails
    
    db.delete(pizza)
    db.commit()
    return None

@router.delete("/delete_sauce/{sauce_id}", status_code=204)
async def delete_sauce(sauce_id: int, db: Session = Depends(get_db)):
    """Delete a sauce"""
    sauce = db.query(SauceModel).filter(SauceModel.id == sauce_id).first()
    if not sauce:
        raise HTTPException(status_code=404, detail="Sauce not found")
    db.delete(sauce)
    db.commit()
    return None

@router.delete("/delete_crust/{crust_id}", status_code=204)
async def delete_crust(crust_id: int, db: Session = Depends(get_db)):
    """Delete a crust"""
    crust = db.query(CrustModel).filter(CrustModel.id == crust_id).first()
    if not crust:
        raise HTTPException(status_code=404, detail="Crust not found")
    db.delete(crust)
    db.commit()
    return None

@router.delete("/delete_topping/{topping_id}", status_code=204)
async def delete_topping(topping_id: int, db: Session = Depends(get_db)):
    """Delete a topping"""
    topping = db.query(ToppingModel).filter(ToppingModel.id == topping_id).first()
    if not topping:
        raise HTTPException(status_code=404, detail="Topping not found")
    db.delete(topping)
    db.commit()
    return None

@router.delete("/delete_size/{size_id}", status_code=204)
async def delete_size(size_id: int, db: Session = Depends(get_db)):
    """Delete a size"""
    logger.info(f"Deleting size: {size_id}")
    size = db.query(SizeModel).filter(SizeModel.id == size_id).first()
    if not size:
        logger.error(f"Size not found: {size_id}")
        raise HTTPException(status_code=404, detail="Size not found")
    db.delete(size)
    db.commit()
    return None

@router.delete("/delete_pizza_topping_category/{category_id}", status_code=204)
async def delete_pizza_topping_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a topping category"""
    category = db.query(ToppingCategoryModel).filter(ToppingCategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Topping category not found")
    db.delete(category)
    db.commit()
    return None
