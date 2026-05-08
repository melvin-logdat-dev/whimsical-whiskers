// CompareTable.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import catImage from "../assets/calico-cat.png"; // adjust path if needed

const ATTRS = [
  { key: "name", label: "Name" },
  { key: "origin", label: "Origin" },
  { key: "temperament", label: "Temperament", renderer: "temperament" },
  { key: "life_span", label: "Life Span", renderer: "lifeSpan" },
  { key: "weight", label: "Weight", renderer: "weight" },
  { key: "description", label: "Description", renderer: "description" },
  { key: "adaptability", label: "Adaptability", renderer: "rating" },
  { key: "affection_level", label: "Affection Level", renderer: "rating" },
  { key: "child_friendly", label: "Child Friendly", renderer: "rating" },
  { key: "dog_friendly", label: "Dog Friendly", renderer: "rating" },
  { key: "energy_level", label: "Energy Level", renderer: "rating" },
];

const truncate = (text, n = 140) =>
  text && text.length > n ? text.slice(0, n).trim() + "…" : text || "—";

const renderWeight = (breed) => {
  if (!breed) return "—";
  const metric = breed.weight?.metric;
  if (metric) return `${metric} kg`;
  const imperial = breed.weight?.imperial;
  return imperial ? `${imperial} lb` : "—";
};

const renderLifeSpan = (breed) => {
  if (!breed) return "—";
  return breed.life_span ? `${breed.life_span} years` : "—";
};

const renderTemperamentChips = (breed) => {
  const t = breed?.temperament;
  if (!t) return "—";
  return t
    .split(",")
    .slice(0, 6)
    .map((s, i) => (
      <span key={i} className="compare-chip" title={s.trim()}>
        {s.trim()}
      </span>
    ));
};

const Rating = ({ value }) => {
  if (value == null) return <span>—</span>;
  const v = Math.round(Number(value));
  return (
    <div className="compare-rating" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={
            i < v ? "compare-star compare-star--filled" : "compare-star"
          }
        >
          ★
        </span>
      ))}
      <span className="compare-rating__num">{v}</span>
    </div>
  );
};

const DescriptionCell = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span>—</span>;
  return (
    <div>
      <div className="compare-desc">
        {expanded ? text : truncate(text, 160)}
      </div>
      {text.length > 160 && (
        <button
          onClick={() => setExpanded((s) => !s)}
          className="compare-link-btn"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
};

const CompareTable = ({ firstBreedId, secondBreedId }) => {
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef({});

  useEffect(() => {
    if (!firstBreedId && !secondBreedId) {
      setFirst(null);
      setSecond(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const fetchBreedWithImage = async (id) => {
      if (!id) return null;
      if (cacheRef.current[id]) return cacheRef.current[id];

      try {
        const breedRes = await axios.get(
          `https://api.thecatapi.com/v1/breeds/${id}`,
          {
            signal: controller.signal,
            timeout: 8000,
          },
        );
        const breed = breedRes.data || null;

        if (breed && breed.image && breed.image.url) {
          cacheRef.current[id] = breed;
          return breed;
        }

        if (breed && breed.reference_image_id) {
          try {
            const imgRes = await axios.get(
              `https://api.thecatapi.com/v1/images/${breed.reference_image_id}`,
              { signal: controller.signal, timeout: 8000 },
            );
            const imgData = imgRes.data;
            breed.image = imgData
              ? { url: imgData.url, id: imgData.id }
              : undefined;
            cacheRef.current[id] = breed;
            return breed;
          } catch (imgErr) {
            console.warn("reference image fetch failed for", id, imgErr);
          }
        }

        try {
          const searchRes = await axios.get(
            `https://api.thecatapi.com/v1/images/search?breed_ids=${id}&limit=1`,
            { signal: controller.signal, timeout: 8000 },
          );
          const arr = searchRes.data || [];
          if (arr.length > 0) {
            breed.image = { url: arr[0].url, id: arr[0].id };
          } else {
            breed.image = undefined;
          }
        } catch (searchErr) {
          console.warn("images search failed for", id, searchErr);
          breed.image = undefined;
        }

        cacheRef.current[id] = breed;
        return breed;
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError")
          return null;
        console.error("Error fetching breed", id, err);
        throw err;
      }
    };

    Promise.all([
      fetchBreedWithImage(firstBreedId).then((b) => setFirst(b)),
      fetchBreedWithImage(secondBreedId).then((b) => setSecond(b)),
    ])
      .catch((err) => {
        if (err && err.name !== "CanceledError" && err.name !== "AbortError") {
          setError("Failed to load breed data. Try again.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [firstBreedId, secondBreedId]);

  if (!firstBreedId && !secondBreedId) return null;

  if (loading) {
    return <div className="compare-loading" style={{textAlign: "center"}}>Loading comparison…</div>;
  }

  if (error) {
    return <div className="compare-error" style={{textAlign: "center"}}>{error}</div>;
  }

  const imageUrlOrFallback = (breed) => {
    if (!breed) return catImage;
    return breed.image?.url || catImage;
  };

  const renderCell = (breed, attr) => {
    if (!breed) return <td className="compare-table__cell">—</td>;

    if (attr.renderer === "weight") {
      return <td className="compare-table__cell">{renderWeight(breed)}</td>;
    }
    if (attr.renderer === "lifeSpan") {
      return <td className="compare-table__cell">{renderLifeSpan(breed)}</td>;
    }
    if (attr.renderer === "temperament") {
      return (
        <td className="compare-table__cell">{renderTemperamentChips(breed)}</td>
      );
    }
    if (attr.renderer === "rating") {
      return (
        <td className="compare-table__cell">
          <Rating value={breed[attr.key]} />
        </td>
      );
    }
    if (attr.renderer === "description") {
      return (
        <td className="compare-table__cell">
          <DescriptionCell text={breed.description} />
        </td>
      );
    }

    const value = breed[attr.key];
    return <td className="compare-table__cell">{value ?? "—"}</td>;
  };

  return (
    <div style={{ marginTop: 20 }}>
      <table className="compare-table">
        <thead>
          <tr>
            <th className="compare-table__header" />
            <th className="compare-table__header--center">
              {first ? first.name : "First breed"}
            </th>
            <th className="compare-table__header--center">
              {second ? second.name : "Second breed"}
            </th>
          </tr>
        </thead>

        <tbody>
          {ATTRS.map((a) => (
            <tr key={a.key} className="compare-table__row">
              <td className="compare-table__attr">{a.label}</td>
              {renderCell(first, a)}
              {renderCell(second, a)}
            </tr>
          ))}

          <tr className="compare-table__row">
            <td className="compare-table__attr">Image</td>
            <td className="compare-table__cell compare-table__image-cell">
              <img
                src={imageUrlOrFallback(first)}
                alt={first?.name ? `${first.name} photo` : "Breed image"}
                loading="lazy"
                className="compare-table__image"
              />
              <div className="compare-table__img-caption">
                {first?.name || "—"} {first?.origin ? `• ${first.origin}` : ""}
              </div>
            </td>
            <td className="compare-table__cell compare-table__image-cell">
              <img
                src={imageUrlOrFallback(second)}
                alt={second?.name ? `${second.name} photo` : "Breed image"}
                loading="lazy"
                className="compare-table__image"
              />
              <div className="compare-table__img-caption">
                {second?.name || "—"}{" "}
                {second?.origin ? `• ${second.origin}` : ""}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CompareTable;
