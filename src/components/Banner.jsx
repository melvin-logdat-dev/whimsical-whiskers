import catImage from "../assets/calico-cat.png";
import preloader from "../assets/loading-cat.gif";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const Banner = ({ breedId }) => {
  const [images, setImages] = useState([]);
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
            `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=5`,
          ),
        ]);

        const breedData = await breedRes.json();
        const imageData = await imageRes.json();

        setBreedName(breedData?.name || "Cat");

        if (imageData?.length > 0) {
          setImages(
            imageData.map((img) => ({
              src: img.url,
              alt: breedData?.name || "Cat",
            })),
          );
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
  }, [breedId]);

  return (
    <div className="bannerContainer">
      {isLoading ? (
        <img src={preloader} alt="preloader" className="preloader" />
      ) : images.length > 0 ? (
        <>
          <Swiper
            modules={[Navigation, Autoplay]}
            loop
            autoplay={{ delay: 3000 }}
            autoHeight={true}
            spaceBetween={20}
            navigation={true}
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img.src} alt={img.alt} className="BannerImage" />
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      ) : (
        <img src={catImage} alt="Cat Banner" className="BannerImage" />
      )}
    </div>
  );
};

export default Banner;
