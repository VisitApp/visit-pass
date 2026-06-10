"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { testimonials } from "@/constants";
import Testimonial from "../../common/Testimonial/Testimonial";
import s from "./Testimonials.module.scss";

export default function Testimonials() {
  return (
    <section className={s.section}>
      <h2 className={s.title}>Testimonials</h2>
      <p className={s.subtitle}>
        Better care, lower costs proven by the people who matter most
      </p>

      <div className={s.carousel}>
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={1}
          spaceBetween={16}
          loop
          speed={700}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
        >
          {testimonials.map((item, i) => (
            <SwiperSlide key={i}>
              <Testimonial {...item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
