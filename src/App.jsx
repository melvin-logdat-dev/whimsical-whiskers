import { useState } from "react";
import Header from "./components/Header";
import Banner from "./components/Banner";
import SearchForm from "./components/SearchForm";
import CompareTable from "./components/CompareTable";

function App() {
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [comparePair, setComparePair] = useState({ first: "", second: "" });
  const [compareMode, setCompareMode] = useState(false);

  return (
    <div className="app-body">
      <Header />

      {!(compareMode && (comparePair.first || comparePair.second)) && (
        <Banner breedId={selectedBreed} hideSlider={compareMode} />
      )}
      <SearchForm
        // onBreedSelect={setSelectedBreed}
        onBreedSelect={(id) => {
          setSelectedBreed(id);
          setComparePair({ first: "", second: "" });
        }}
        onCompare={(firstId, secondId) => {
          setComparePair({ first: firstId, second: secondId });
          setSelectedBreed(firstId || null);
        }}
        onCompareModeChange={(isOn) => setCompareMode(isOn)}
      />
      {compareMode && (comparePair.first || comparePair.second) && (
        <div style={{ marginTop: 20 }}>
          <CompareTable
            firstBreedId={comparePair.first}
            secondBreedId={comparePair.second}
          />
        </div>
      )}
    </div>
  );
}

export default App;
