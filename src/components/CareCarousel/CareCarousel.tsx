"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import styles from "./CareCarousel.module.scss";

type CareCarouselProps = {
  images: string[];
  /** ms each slide holds before advancing */
  interval?: number;
};

export default function CareCarousel({
  images,
  interval = 2600,
}: CareCarouselProps) {
  return (
    <div className={styles.track}>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1.2}
        spaceBetween={20}
        loop
        autoplay={{ delay: interval, disableOnInteraction: false }}
        style={{ paddingLeft: 20, paddingRight: 20 }}
      >
        {images.map((src, i) => (
          <SwiperSlide key={i} className={styles.slide}>
            <div className={styles.card}>
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 600px) 80vw, 300px"
                className={styles.img}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
