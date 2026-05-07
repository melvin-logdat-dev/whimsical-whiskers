import catImage from "../assets/calico-cat.png";
import preloader from "../assets/loading-cat.gif";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const Banner = ({ breedId }) => {
  const [images, setImages] = useState([]);
  const [breedName, setBreedName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef({}); // useRef instead of state

  useEffect(() => {
    if (!breedId) return;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Use cacheRef
        if (cacheRef.current[breedId]) {
          setImages(cacheRef.current[breedId].images);
          setBreedName(cacheRef.current[breedId].breedName);
          setIsLoading(false);
          return;
        }

        const [breedRes, imageRes] = await Promise.all([
          axios.get(`https://api.thecatapi.com/v1/breeds/${breedId}`, {
            signal: controller.signal,
            timeout: 8000,
          }),
          axios.get(
            `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=5`,
            { signal: controller.signal, timeout: 8000 },
          ),
        ]);

        const name = breedRes.data?.name || "Cat";
        setBreedName(name);

        const imageData = imageRes.data || [];
        if (imageData.length > 0) {
          const preloadPromises = imageData.map(
            (img) =>
              new Promise((resolve) => {
                const imageObj = new Image();
                imageObj.src = img.url;
                imageObj.onload = () => resolve({ src: img.url, alt: name });
                imageObj.onerror = () => resolve({ src: img.url, alt: name });
              }),
          );
          const loadedImages = await Promise.all(preloadPromises);
          setImages(loadedImages);
          cacheRef.current[breedId] = { images: loadedImages, breedName: name };
        } else {
          setImages([{ src: catImage, alt: "Cat Banner" }]);
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Error fetching banner data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [breedId]);

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
