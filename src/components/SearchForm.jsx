import React, { useState, useEffect, useRef } from "react";

const SearchForm = ({ onBreedSelect }) => {
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch("https://api.thecatapi.com/v1/breeds");
        const data = await res.json();
        if (isMounted) {
          setBreeds(data);
        }
      } catch (err) {
        console.error("Error fetching breeds:", err);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle breed selection change
  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedBreed(value);
    onBreedSelect(value);
  };

  return (
    <div className="searchFormContainer">
      <form className="formSearch">
        <select
          value={selectedBreed}
          onChange={handleSelectChange}
          className="breedSelect"
        >
          <option value="" disabled>
            Select breed
          </option>
          {breeds.map((breed) => (
            <option key={breed.id} value={breed.id}>
              {breed.name}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
};

export default SearchForm;
