import catImage from "../assets/calico-cat.png";
import preloader from "../assets/loading-cat.gif";
import axios from "axios";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const Banner = ({ breedId }) => {
  const [images, setImages] = useState([]);
  const [breedName, setBreedName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState({}); // simple cache

  useEffect(() => {
    if (!breedId) return;
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // if cached, use it immediately
        if (cache[breedId]) {
          setImages(cache[breedId].images);
          setBreedName(cache[breedId].breedName);
          setIsLoading(false);
          return;
        }

        const [breedRes, imageRes] = await Promise.all([
          axios.get(`https://api.thecatapi.com/v1/breeds/${breedId}`, {
            signal: controller.signal,
          }),
          axios.get(
            `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=5`,
            { signal: controller.signal },
          ),
        ]);

        const breedData = breedRes.data;
        const imageData = imageRes.data;

        const name = breedData?.name || "Cat";
        setBreedName(name);

        if (imageData?.length > 0) {
          // preload all images before setting state
          const preloadPromises = imageData.map(
            (img) =>
              new Promise((resolve) => {
                const imageObj = new Image();
                imageObj.src = img.url;
                imageObj.onload = () => resolve({ src: img.url, alt: name });
              }),
          );

          const loadedImages = await Promise.all(preloadPromises);
          setImages(loadedImages);

          // save to cache
          setCache((prev) => ({
            ...prev,
            [breedId]: { images: loadedImages, breedName: name },
          }));
        } else {
          setImages([{ src: catImage, alt: "Cat Banner" }]);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching banner data:", err);
        setIsLoading(false);
      }
    };

    fetchData();
    // Cleanup: abort request if breedId changes or component unmounts
    return () => {
      controller.abort();
    };
  }, [breedId, cache]);

  return (
    <div className="bannerContainer">
      {isLoading ? (
        <img src={preloader} alt="preloader" className="preloader" />
      ) : images.length > 0 ? (
        <Swiper
          key={breedId} // forces reload when breed changes
          modules={[Navigation, Autoplay]}
          loop
          autoplay={{ delay: 3000 }}
          autoHeight={true}
          spaceBetween={20}
          navigation={images.length > 0}
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <img src={img.src} alt={breedName} className="BannerImage" />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <img src={catImage} alt="Cat Banner" className="BannerImage" />
      )}
    </div>
  );
};

export default Banner;
