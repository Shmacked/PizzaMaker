"""
Seed script to populate the database with initial data
Run this script once to migrate your fake data to the database
"""
from database import SessionLocal
from models.pizza_models import (
    Size, Sauce, Crust, ToppingCategory, Topping, Pizza
)

def seed_database():
    """Populate database with initial data"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Size).count() > 0:
            print("Database already seeded. Skipping...")
            return
        
        # Create Sizes
        sizes = [
            Size(size="Small", base_price=10.0),
            Size(size="Medium", base_price=15.0),
            Size(size="Large", base_price=20.0),
            Size(size="Extra Large", base_price=25.0),
        ]
        db.add_all(sizes)
        db.commit()
        print("✓ Created sizes")
        
        # Create Sauces
        sauces = [
            Sauce(name="Tomato", price=1.0),
            Sauce(name="Alfredo", price=2.0),
            Sauce(name="Barbecue", price=2.0),
        ]
        db.add_all(sauces)
        db.commit()
        print("✓ Created sauces")
        
        # Create Crusts
        crusts = [
            Crust(name="Thin", price=1.0),
            Crust(name="Thick", price=2.0),
            Crust(name="Deep Dish", price=3.0),
            Crust(name="Gluten Free", price=3.0),
            Crust(name="Stuffed", price=3.0),
        ]
        db.add_all(crusts)
        db.commit()
        print("✓ Created crusts")
        
        # Create Topping Categories
        meat_category = ToppingCategory(name="Meat", description="Meat toppings")
        vegetable_category = ToppingCategory(name="Vegetable", description="Vegetable toppings")
        db.add(meat_category)
        db.add(vegetable_category)
        db.commit()
        print("✓ Created topping categories")
        
        # Create Toppings
        toppings_data = [
            ("Pepperoni", 1.50, [meat_category]),
            ("Mushrooms", 1.50, [vegetable_category]),
            ("Onions", 1.00, [vegetable_category]),
            ("Bell Peppers", 1.00, [vegetable_category]),
            ("Spinach", 1.00, [vegetable_category]),
            ("Anchovies", 1.00, [meat_category]),
            ("Pineapple", 1.00, [vegetable_category]),
            ("Ham", 1.50, [meat_category]),
            ("Sausage", 1.50, [meat_category]),
            ("Chicken", 1.50, [meat_category]),
            ("Bacon", 1.50, [meat_category]),
            ("Artichoke", 1.00, [vegetable_category]),
            ("Jalapenos", 1.00, [vegetable_category]),
            ("Olives", 1.00, [vegetable_category]),
            ("Tomatoes", 1.00, [vegetable_category]),
            ("Garlic", 1.00, [vegetable_category]),
            ("Red Onions", 1.00, [vegetable_category]),
            ("Green Onions", 1.00, [vegetable_category]),
            ("Red Peppers", 1.00, [vegetable_category]),
        ]
        
        toppings = []
        for name, price, categories in toppings_data:
            topping = Topping(name=name, price=price)
            topping.categories = categories
            toppings.append(topping)
        
        db.add_all(toppings)
        db.commit()
        print("✓ Created toppings")
        
        # Refresh to get IDs
        db.refresh(meat_category)
        db.refresh(vegetable_category)
        for topping in toppings:
            db.refresh(topping)
        
        # Get objects for pizza creation
        all_sizes = db.query(Size).all()
        tomato_sauce = db.query(Sauce).filter(Sauce.name == "Tomato").first()
        thick_crust = db.query(Crust).filter(Crust.name == "Thick").first()
        
        onions_topping = next(t for t in toppings if t.name == "Onions")
        bell_peppers_topping = next(t for t in toppings if t.name == "Bell Peppers")
        spinach_topping = next(t for t in toppings if t.name == "Spinach")
        pepperoni_topping = next(t for t in toppings if t.name == "Pepperoni")
        
        # Create Designer Pizzas
        margherita = Pizza(
            name="Margherita",
            description="A classic pizza with tomato sauce, mozzarella, and basil",
            image_url="https://example.com/margherita.jpg",
            is_available=True,
            sauce_id=tomato_sauce.id,
            crust_id=thick_crust.id
        )
        margherita.sizes = all_sizes
        margherita.toppings = [onions_topping, bell_peppers_topping, spinach_topping]
        
        pepperoni_pizza = Pizza(
            name="Pepperoni",
            description="A pizza with pepperoni, mozzarella, and tomato sauce",
            image_url="https://example.com/pepperoni.jpg",
            is_available=True,
            sauce_id=tomato_sauce.id,
            crust_id=thick_crust.id
        )
        pepperoni_pizza.sizes = all_sizes
        pepperoni_pizza.toppings = [pepperoni_topping]
        
        vegetarian_pizza = Pizza(
            name="Vegetarian",
            description="A pizza with vegetables, mozzarella, and tomato sauce",
            image_url="https://example.com/vegetarian.jpg",
            is_available=True,
            sauce_id=tomato_sauce.id,
            crust_id=thick_crust.id
        )
        vegetarian_pizza.sizes = all_sizes
        # Get all vegetable toppings
        vegetable_toppings = [t for t in toppings if vegetable_category in t.categories]
        vegetarian_pizza.toppings = vegetable_toppings
        
        db.add(margherita)
        db.add(pepperoni_pizza)
        db.add(vegetarian_pizza)
        db.commit()
        print("✓ Created designer pizzas")
        
        print("\n✅ Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

