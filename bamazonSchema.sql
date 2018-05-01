DROP DATABASE IF EXISTS bamazon_DB;

CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  product VARCHAR(50) NULL,
  department VARCHAR(50) NULL,
  price INT NULL,
  stock INT NULL,
  PRIMARY KEY (id)
);

INSERT INTO products (product, department, price, stock)
VALUES ("shirt", "clothing", 20, 50), ("pants", "clothing", 25, 50), ("TV", "electronics", 200, 40), ("laptop", "electronics", 800, 150), ("bicycyle", "outdoors", 350, 25), ("lawnmower", "outdoors", 200, 25), ("pool table", "recreation", 1200, 10), ("headphones", "electronic", 30, 200), ("grill", "recreation", 200, 50), ("pool noodle", "recreation", 15, 400);