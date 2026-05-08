// SearchForm.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const SearchForm = ({ onBreedSelect, onCompare, onCompareModeChange }) => {
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [compareFirst, setCompareFirst] = useState("");
  const [compareSecond, setCompareSecond] = useState("");
  const [inlineError, setInlineError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get("https://api.thecatapi.com/v1/breeds", { signal: controller.signal })
      .then((res) => setBreeds(res.data || []))
      .catch((err) => {
        if (err.name === "CanceledError") return;
        console.error("Error fetching breeds", err);
      });
    return () => controller.abort();
  }, []);

  // === CHANGE: hide main select whenever compare mode is active ===
  // This prevents the main select from reappearing when the user changes the first compare select.
  const shouldHideMainSelect = compareMode;

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedBreed(value);
    if (onBreedSelect) onBreedSelect(value);
  };

  const toggleCompareMode = () => {
    const next = !compareMode;
    setCompareMode(next);
    setInlineError("");

    if (next) {
      // entering compare mode: copy current main selection into first compare slot (if any)
      if (selectedBreed) {
        setCompareFirst(selectedBreed);
      }
      if (onCompareModeChange) onCompareModeChange(true);
      return;
    }

    // leaving compare mode: clear compare selections
    setCompareFirst("");
    setCompareSecond("");
    if (onCompareModeChange) onCompareModeChange(false);
  };

  const handleCompare = () => {
    setInlineError("");
    if (!compareFirst || !compareSecond) {
      setInlineError("Please select two breeds to compare.");
      return;
    }
    if (compareFirst === compareSecond) {
      setInlineError("Choose two different breeds.");
      return;
    }
    if (onCompare) onCompare(compareFirst, compareSecond);
  };

  return (
    <div className="searchFormContainer">
      <form className="formSearch" onSubmit={(e) => e.preventDefault()}>
        <div className="buttonContainer">
          {/* Main select: hidden whenever compareMode is true */}
          {!shouldHideMainSelect && (
            <select
              value={selectedBreed}
              onChange={handleSelectChange}
              className="breedSelect"
            >
              <option value="">Select breed</option>
              {breeds.map((breed) => (
                <option key={breed.id} value={breed.id}>
                  {breed.name}
                </option>
              ))}
            </select>
          )}

          {/* When hidden, show a pill with the copied/selected first breed and a clear button */}
          {shouldHideMainSelect && (
            <div
              className="copiedBreedPill"
              role="status"
              aria-live="polite"
              style={{
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                background: "#fff7cc",
                borderRadius: 8,
                border: "1px solid #efe6b0",
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {breeds.find((b) => b.id === compareFirst)?.name ||
                  breeds.find((b) => b.id === selectedBreed)?.name ||
                  "Selected"}
              </span>
              <button
                type="button"
                onClick={() => {
                  // clear the copied first selection and reveal the main select
                  setCompareFirst("");
                }}
                aria-label="Clear copied breed"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={toggleCompareMode}
            className="btn btn-cancel"
            aria-pressed={compareMode}
          >
            {compareMode ? "Cancel Compare" : "Compare Breeds"}
          </button>
        </div>

        {compareMode && (
          <div className="compareControls" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={compareFirst}
                onChange={(e) => setCompareFirst(e.target.value)}
                className="breedSelect compareSelect"
              >
                <option value="">Choose first breed</option>
                {breeds.map((breed) => (
                  <option key={breed.id} value={breed.id}>
                    {breed.name}
                  </option>
                ))}
              </select>

              <select
                value={compareSecond}
                onChange={(e) => setCompareSecond(e.target.value)}
                className="breedSelect compareSelect"
              >
                <option value="">Choose second breed</option>
                {breeds.map((breed) => (
                  <option key={breed.id} value={breed.id}>
                    {breed.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleCompare}
                className="btn btn-compare"
                disabled={
                  !compareFirst ||
                  !compareSecond ||
                  compareFirst === compareSecond
                }
              >
                Show Comparison
              </button>
            </div>

            {inlineError && (
              <div
                className="inlineError"
                style={{ color: "crimson", marginTop: 8 }}
              >
                {inlineError}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchForm;
