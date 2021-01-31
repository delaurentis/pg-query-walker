SELECT name, born_at, a.name AS species 
FROM pets
INNER JOIN animals a ON a.id = pets.animal_id
WHERE 
  a.name = 'dog' OR 
  a.name = 'cat' OR 
  a.name = 'rabbit'
ORDER BY born_at