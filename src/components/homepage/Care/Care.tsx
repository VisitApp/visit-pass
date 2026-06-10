"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { careImages } from "@/constants";
import s from "./Care.module.scss";

export default function Care() {
  return (
    <section className={s.section}>
      <h2 className={s.title}>
        Care that goes
        <br />
        beyond the consult
      </h2>
      <p className={s.subtitle}>
        Set the goal. Take the action. Watch the risk. Care that doesn&apos;t
        pause when your consult ends.
      </p>

      <div className={s.track}>
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1.2}
          spaceBetween={16}
          slidesOffsetBefore={16}
          slidesOffsetAfter={16}
          loop
          speed={800}
          autoplay={{ delay: 2600, disableOnInteraction: false }}
        >
          {careImages.map((src, i) => (
            <SwiperSlide key={i} className={s.slide}>
              <div className={s.card}>
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 600px) 80vw, 300px"
                  className={s.img}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
