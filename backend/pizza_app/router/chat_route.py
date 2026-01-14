from fastapi import APIRouter, Depends, HTTPException
from pizza_app.models.chat_schemas import ChatRequest, ChatResponse, ChatMessage, PizzaRoute
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel, function_tool, set_tracing_disabled
from pizza_app.models.pizza_schemas import Pizza, Size, Sauce, Crust, Topping, ToppingCategory
import httpx
import json
import time
import logging
from typing import Union

logger = logging.getLogger(__name__)

set_tracing_disabled(True)

client = AsyncOpenAI(
    api_key="ollama",
    base_url="http://localhost:11434/v1"
)

model = OpenAIChatCompletionsModel(
    model="llama3.2:latest",
    openai_client=client
)

pizza_routes = [
    PizzaRoute(
        # you specify the ID (integer) in the route
        route="/pizza/get_pizza_size/{size_id}",
        method="GET",
        description="Get a specific pizza size by ID",
        parameters=["size_id"],
        response={"type": "object", "properties": Size.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        route="/pizza/get_pizza_sizes",
        method="GET",
        description="Get all pizza sizes",
        parameters=[],
        response={"type": "object", "properties": Size.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        # you specify the ID (integer) in the route
        route="/pizza/get_pizza_sauce/{sauce_id}",
        method="GET",
        description="Get a specific pizza sauce by ID",
        parameters=["sauce_id"],
        response={"type": "object", "properties": Sauce.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        route="/pizza/get_pizza_sauces",
        method="GET",
        description="Get all pizza sauces",
        parameters=[],
        response={"type": "object", "properties": Sauce.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        # you specify the ID (integer) in the route
        route="/pizza/get_pizza_crust/{crust_id}",
        method="GET",
        description="Get a specific pizza crust by ID",
        parameters=["crust_id"],
        response={"type": "object", "properties": Crust.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        route="/pizza/get_pizza_crusts",
        method="GET",
        description="Get all pizza crusts",
        parameters=[],
        response={"type": "object", "properties": Crust.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        # you specify the ID (integer) in the route
        route="/pizza/get_pizza_topping/{topping_id}",
        method="GET",
        description="Get a specific pizza topping by ID",
        parameters=["topping_id"],
        response={"type": "object", "properties": Topping.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        route="/pizza/get_pizza_toppings",
        method="GET",
        description="Get all pizza toppings",
        parameters=[],
        response={"type": "object", "properties": Topping.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        # you specify the ID (integer) in the route
        route="/pizza/get_pizza_topping_category/{category_id}",
        method="GET",
        description="Get a specific pizza topping category by ID",
        parameters=["category_id"],
        response={"type": "object", "properties": ToppingCategory.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        route="/pizza/get_pizza_topping_categories",
        method="GET",
        description="Get all pizza topping categories",
        parameters=[],
        response={"type": "object", "properties": ToppingCategory.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        # you specify the ID (integer) in the route
        route="/pizza/get_designer_pizza/{pizza_id}",
        method="GET",
        description="Get a specific designer pizza by ID",
        parameters=["pizza_id"],
        response={"type": "object", "properties": Pizza.model_json_schema()}
    ).model_dump(),
    PizzaRoute(
        route="/pizza/get_designer_pizzas",
        method="GET",
        description="Get all designer pizzas",
        parameters=[],
        response={"type": "object", "properties": Pizza.model_json_schema()}
    ).model_dump()
]

pizza_schemes = [
    Size.model_json_schema(),
    Sauce.model_json_schema(),
    Crust.model_json_schema(),
    Topping.model_json_schema(),
    ToppingCategory.model_json_schema(),
    Pizza.model_json_schema()
]

for schema in pizza_schemes:
    if '$defs' in schema:
        del schema['$defs']


@function_tool()
def get_pizza_route(index: int) -> dict:
    """Get a specific pizza route by ID"""
    logger.info(f"Getting pizza route for index {index}")
    print(f"Getting pizza route for index {index}")
    return pizza_routes[index]

@function_tool()
def get_pizza_route_attribute(index: int, attribute: str) -> Union[str, int, float, bool, list, dict]:
    """Get a specific attribute from a pizza route"""
    logger.info(f"Getting pizza route attribute {attribute} for index {index}")
    print(f"Getting pizza route attribute {attribute} for index {index}")
    return pizza_routes[index].get(attribute)

@function_tool()
def get_pizza_scheme(index: int) -> dict:
    """Get a specific pizza scheme by ID"""
    logger.info(f"Getting pizza scheme for index {index}")
    print(f"Getting pizza scheme for index {index}")
    return pizza_schemes[index]

@function_tool()
def get_pizza_scheme_attribute(index: int, attribute: str) -> Union[str, int, float, bool, list, dict]:
    """Get a specific attribute from a pizza scheme"""
    logger.info(f"Getting pizza scheme attribute {attribute} for index {index}")
    return pizza_schemes[index].get(attribute)

@function_tool()
async def http_request(method: str, route: str) -> dict:
    """When passing the route, you DON'T include the base url, just the route"""
    logger.info(f"Making HTTP request to {method} {route}")
    print(f"Making HTTP request to {method} {route}")
    async with httpx.AsyncClient() as client:
        response = await client.request(method, f"http://localhost:9002{route}")
        return response.json()

tools = [http_request, get_pizza_route, get_pizza_scheme, get_pizza_route_attribute, get_pizza_scheme_attribute]

pizza_agent = Agent(
    name="pizza_agent",
    instructions=f"""
        You are a helpful assistant that thinks critically about the user's request and thinks step by step about how to best fulfill it, then fullfills it.
        In addition to conversational responses, you can also do anything described in the routes available to you.
        You also have these routes to use with your HTTP requests tool:
        {json.dumps(pizza_routes)}
        Important notes on the PizzaRoutes:
         - Pay attention to the "route" key in the PizzaRoutes object. It's all you need to use the HTTP requests tool.
         - DO NOT use any other route other than the ones provided to you in the PizzaRoutes object.
         - The method is the HTTP method to use, GET, POST, PUT, DELETE, etc.
         - The parameters are the parameters to pass in the route.
         - The response is the expected response from the endpoint.
         - You can also use the get_pizza_route and get_pizza_route_attribute tools to get the PizzaRoute and its attributes. It is 0 indexed.
        If you need to access information on those routes, please use the HTTP requests tool.
        To help you determine which route to use and what information you will have available to you, you have these schemes available to you:
        {json.dumps(pizza_schemes)}.
        Important notes on the PizzaSchemes:
        - You can use the get_pizza_scheme and get_pizza_scheme_attribute tools to get the PizzaScheme and its attributes. It is 0 indexed.
        If you can't access information on those routes, tools, schemes, or need more information, please let the user know.
        You might have to get all pizzas by using the HTTP requests tool to get all pizzas and then use the get_pizza_scheme tool to get the PizzaScheme and its attributes for each pizza.
    """,
    tools=tools,
    model=model
)

test_agent = Agent(
    name="test_agent",
    instructions=f"""
        You are a helpful assistant that only outputs the text "test".
    """,
    tools=tools,
    model=model
)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/")
async def chat(request: ChatRequest):
    try:
        print(f"Chat request: {request.message}")
        # First response from the model
        start_time = time.time()
        response = await Runner.run(pizza_agent, request.message)
        end_time = time.time()
        logger.info(f"Time taken to respond: {end_time - start_time} seconds.")
        return ChatResponse(response=response.final_output)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test")
async def test_chat():
    try:
        response = await Runner.run(test_agent, "Who are you?")
        
        return ChatResponse(response=response.final_output)
    except Exception as e:
        # This will now catch if 'response' is still a coroutine
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
