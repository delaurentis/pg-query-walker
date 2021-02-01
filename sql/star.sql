SELECT pets.*, a.name AS species 
FROM pets
INNER JOIN animals a ON a.id = pets.animal_id