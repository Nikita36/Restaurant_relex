INSERT INTO ingredients VALUES (1, 'Картофель', 'кг');
select nextval('ingredients_id_seq');
INSERT INTO ingredients VALUES (2, 'Молоко', 'л');
select nextval('ingredients_id_seq');
INSERT INTO ingredients VALUES (3, 'Яйца', 'шт');
select nextval('ingredients_id_seq');

INSERT INTO ingredient_parts VALUES (1, 1, 30, '2019-08-08');
select nextval('ingredient_parts_id_seq');
INSERT INTO ingredient_parts VALUES (2, 1, 10, '2019-07-18');
select nextval('ingredient_parts_id_seq');
INSERT INTO ingredient_parts VALUES (3, 2, 1.2, '2019-07-18');
select nextval('ingredient_parts_id_seq');
INSERT INTO ingredient_parts VALUES (4, 2, 13, '2019-08-18');
select nextval('ingredient_parts_id_seq');
