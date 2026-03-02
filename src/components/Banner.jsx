import catImage from "../assets/calico-cat.png";
import preloader from "../assets/loading-cat.gif";
import { useState, useEffect } from "react";

const Banner = ({ breedId }) => {
  const [breedImage, setBreedImage] = useState(null);
  const [breedName, setBreedName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!breedId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [breedRes, imageRes] = await Promise.all([
          fetch(`https://api.thecatapi.com/v1/breeds/${breedId}`),
          fetch(
            `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}`,
          ),
        ]);

        const breedData = await breedRes.json();
        const imageData = await imageRes.json();

        setBreedName(breedData?.name || "Cat");

        if (imageData?.length > 0) {
          const url = imageData[0]?.url;

          const img = new Image();
          img.src = url;
          img.onload = () => {
            setBreedImage(url);
            setIsLoading(false);
          };
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching banner data:", err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [breedId]);

  return (
    <div className="bannerContainer">
      {isLoading ? (
        <img src={preloader} alt="preloader" className="preloader" />
      ) : breedImage ? (
        <img src={breedImage} alt={breedName} className="BannerImage" />
      ) : (
        <img src={catImage} alt="Cat Banner" className="BannerImage" />
      )}
    </div>
  );
};

export default Banner;
