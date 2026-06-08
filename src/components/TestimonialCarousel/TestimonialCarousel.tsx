"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Testimonial from "../Testimonial/Testimonial";
import styles from "./TestimonialCarousel.module.scss";

type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  savings?: string;
};

type TestimonialCarouselProps = {
  items: TestimonialItem[];
  /** ms each card holds before advancing */
  interval?: number;
};

export default function TestimonialCarousel({
  items,
  interval = 4000,
}: TestimonialCarouselProps) {
  return (
    <div className={styles.carousel}>
      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={16}
        loop
        pagination={{ clickable: true }}
        autoplay={{ delay: interval, disableOnInteraction: false }}
      >
        {items.map((item, i) => (
          <SwiperSlide key={i}>
            <Testimonial {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
