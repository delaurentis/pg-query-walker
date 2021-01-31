WITH common_pets AS (
  SELECT 
    id, 
    name, 
    AGE(born_at) AS age,
    a.name AS species 
  FROM pets
  INNER JOIN animals a ON a.id = pets.animal_id
  WHERE 
    a.name = 'dog' OR 
    a.name = 'cat' OR 
    a.name = 'rabbit'
  ORDER BY born_at
),
common_baby_pets AS (
  SELECT 
    id, 
    name, 
    age, 
    species
  FROM common_pets
  WHERE age < interval '1 year'
)
SELECT 
  COUNT(id) AS baby_count, 
  species
FROM common_baby_pets
GROUP BY species;