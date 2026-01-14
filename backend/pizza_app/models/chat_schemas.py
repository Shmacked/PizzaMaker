from pydantic import BaseModel
from pizza_app.models.pizza_schemas import PizzaUpdate, SizeUpdate, SauceUpdate, CrustUpdate, ToppingUpdate, ToppingCategoryUpdate
from typing import List

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

class ChatMessage(BaseModel):
    role: str
    content: str

class PizzaRoute(BaseModel):
    """You specify the ID (integer) in the route, if necessary."""
    route: str
    method: str
    description: str
    parameters: List[str]
    response: dict
