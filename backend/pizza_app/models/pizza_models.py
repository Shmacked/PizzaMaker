# pizza_app/models/pizza_models.py
from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    Table, ForeignKey
)
from sqlalchemy.orm import relationship
from pizza_app.database import Base, engine

# ----------------------
# Association Tables (Many-to-Many)
# ----------------------
pizza_sizes = Table(
    'pizza_sizes',
    Base.metadata,
    Column('pizza_id', ForeignKey('pizzas.id'), primary_key=True),
    Column('size_id', ForeignKey('sizes.id'), primary_key=True)
)

pizza_toppings = Table(
    'pizza_toppings',
    Base.metadata,
    Column('pizza_id', ForeignKey('pizzas.id'), primary_key=True),
    Column('topping_id', ForeignKey('toppings.id'), primary_key=True)
)

topping_categories = Table(
    'topping_categories_link',  # link table for many-to-many Topping <-> Category
    Base.metadata,
    Column('topping_id', ForeignKey('toppings.id'), primary_key=True),
    Column('category_id', ForeignKey('topping_categories.id'), primary_key=True)
)

# ----------------------
# Tables
# ----------------------
class Size(Base):
    __tablename__ = 'sizes'
    id = Column(Integer, primary_key=True, index=True)
    size = Column(String, nullable=False)
    base_price = Column(Float, nullable=False)

    pizzas = relationship('Pizza', secondary=pizza_sizes, back_populates='sizes')


class Sauce(Base):
    __tablename__ = 'sauces'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)

    pizzas = relationship('Pizza', back_populates='sauce')


class Crust(Base):
    __tablename__ = 'crusts'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)

    pizzas = relationship('Pizza', back_populates='crust')


class ToppingCategory(Base):
    __tablename__ = 'topping_categories'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    toppings = relationship('Topping', secondary=topping_categories, back_populates='categories')


class Topping(Base):
    __tablename__ = 'toppings'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)

    categories = relationship('ToppingCategory', secondary=topping_categories, back_populates='toppings')
    pizzas = relationship('Pizza', secondary=pizza_toppings, back_populates='toppings')


class Pizza(Base):
    __tablename__ = 'pizzas'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)

    # Relationships
    sizes = relationship('Size', secondary=pizza_sizes, back_populates='pizzas')
    toppings = relationship('Topping', secondary=pizza_toppings, back_populates='pizzas')

    sauce_id = Column(Integer, ForeignKey('sauces.id'))
    sauce = relationship('Sauce', back_populates='pizzas')

    crust_id = Column(Integer, ForeignKey('crusts.id'))
    crust = relationship('Crust', back_populates='pizzas')


# ----------------------
# Create tables
# ----------------------
def init_db():
    Base.metadata.create_all(bind=engine)
