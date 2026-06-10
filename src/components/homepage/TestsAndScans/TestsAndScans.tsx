"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { tests } from "@/constants";
import TestCard from "../../common/TestCard/TestCard";
import s from "./TestsAndScans.module.scss";

export default function TestsAndScans() {
  return (
    <section className={s.section}>
      <h2 className={s.title}>
        All tests and Scans are <br />
        covered for you
      </h2>
      <p className={s.subtitle}>
        Your OPD Pass will cover all tests and radiology scans prescribed by our
        doctors, including MRIs, XRAYs and more.
      </p>

      <div className={s.carouselWrap}>
        <span className={s.offPill}>50% off on Lab test</span>
        <div className={s.viewport}>
          <Swiper
            modules={[Autoplay]}
            slidesPerView="auto"
            centeredSlides
            spaceBetween={20}
            loop
            speed={800}
            autoplay={{ delay: 2600, disableOnInteraction: false }}
          >
            {tests.map((item, i) => (
              <SwiperSlide key={i}>
                <TestCard {...item} className={s.card} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
