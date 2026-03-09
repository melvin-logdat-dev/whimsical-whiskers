import { useState, useEffect } from "react";
import axios from "axios";

const SearchForm = ({ onBreedSelect }) => {
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    // Make a request for a user with a given ID
    axios
      .get("https://api.thecatapi.com/v1/breeds", { signal: controller.signal })
      .then((response) => {
        // handle success
        setBreeds(response.data);
      })
      .catch((error) => {
        if (error.name === "CanceledError") {
          return;
        }
        console.error("Error fetching and parsing data", error);
      });

    return () => {
      controller.abort();
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
