"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import styles from "./CareCarousel.module.scss";

type CareCarouselProps = {
  images: string[];
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
        spaceBetween={16}
        slidesOffsetBefore={16}
        slidesOffsetAfter={16}
        loop
        autoplay={{
          delay: interval,
          disableOnInteraction: false,
        }}
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
