# pizza_app/models/schemas.py
from pydantic import BaseModel
from typing import List, Optional

# ----------------------
# Size Schemas
# ----------------------
class SizeBase(BaseModel):
    size: str
    base_price: float

class SizeCreate(SizeBase):
    pass  # For creation, same fields as base

class SizeUpdate(BaseModel):
    """Schema for partial size updates - all fields optional"""
    size: Optional[str] = None
    base_price: Optional[float] = None

class Size(SizeBase):
    id: int

    class Config:
        from_attributes = True


# ----------------------
# Sauce Schemas
# ----------------------
class SauceBase(BaseModel):
    name: str
    price: float

class SauceCreate(SauceBase):
    pass

class SauceUpdate(BaseModel):
    """Schema for partial sauce updates - all fields optional"""
    name: Optional[str] = None
    price: Optional[float] = None

class Sauce(SauceBase):
    id: int

    class Config:
        from_attributes = True


# ----------------------
# Crust Schemas
# ----------------------
class CrustBase(BaseModel):
    name: str
    price: float

class CrustCreate(CrustBase):
    pass

class CrustUpdate(BaseModel):
    """Schema for partial crust updates - all fields optional"""
    name: Optional[str] = None
    price: Optional[float] = None

class Crust(CrustBase):
    id: int

    class Config:
        from_attributes = True


# ----------------------
# Topping Category Schemas
# ----------------------
class ToppingCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class ToppingCategoryCreate(ToppingCategoryBase):
    pass

class ToppingCategoryUpdate(BaseModel):
    """Schema for partial topping category updates - all fields optional"""
    name: Optional[str] = None
    description: Optional[str] = None

class ToppingCategory(ToppingCategoryBase):
    id: int

    class Config:
        from_attributes = True


# ----------------------
# Topping Schemas
# ----------------------
class ToppingBase(BaseModel):
    name: str
    price: float

class ToppingCreate(ToppingBase):
    category_ids: List[int]  # Input as IDs

class ToppingUpdate(BaseModel):
    """Schema for partial topping updates - all fields optional"""
    name: Optional[str] = None
    price: Optional[float] = None
    category_ids: Optional[List[int]] = None

class Topping(ToppingBase):
    id: int
    categories: List[ToppingCategory] = []

    class Config:
        from_attributes = True


# ----------------------
# Pizza Schemas
# ----------------------
class PizzaBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool = True

class PizzaCreate(PizzaBase):
    size_ids: List[int]
    sauce_id: int
    crust_id: int
    topping_ids: List[int]

class PizzaUpdate(BaseModel):
    """Schema for partial pizza updates - all fields optional"""
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    size_ids: Optional[List[int]] = None
    sauce_id: Optional[int] = None
    crust_id: Optional[int] = None
    topping_ids: Optional[List[int]] = None

class Pizza(PizzaBase):
    id: int
    sizes: List[Size] = []
    sauce: Sauce
    crust: Crust
    toppings: List[Topping] = []

    class Config:
        from_attributes = True
