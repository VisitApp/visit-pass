"use client";

import { FiPlus } from "react-icons/fi";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { products } from "@/constants";
import { clsx } from "@/utils/helpers";
import s from "./Medicines.module.scss";
import "swiper/css";

const tracks = [
  { cls: s.diagTrackA, reverse: false },
  { cls: s.diagTrackB, reverse: true },
];

// repeat so the wide (200%) track always has more slides than fit on screen,
// which loop mode requires to scroll continuously
const trackProducts = [...products, ...products, ...products, ...products];

export default function Medicines() {
  return (
    <section className={s.savings}>
      <h2 className={s.sectionTitle}>Smarter Savings on Medicines</h2>
      <p className={s.sectionSubtitle}>
        Enjoy a minimum of 20% off on every order — delivered to you,
        effortlessly.
      </p>

      <div className={s.diagonals}>
        <div className={s.diagBanner}>20% off on all medicines</div>
        <span className={clsx(s.glow, s.glowTL)} aria-hidden="true" />
        <span className={clsx(s.glow, s.glowTR)} aria-hidden="true" />
        <span className={clsx(s.glow, s.glowBL)} aria-hidden="true" />
        <span className={clsx(s.glow, s.glowBR)} aria-hidden="true" />
        {tracks.map((t) => (
          <Swiper
            key={t.cls}
            className={clsx(s.diagTrack, t.cls)}
            modules={[Autoplay]}
            slidesPerView="auto"
            spaceBetween={16}
            loop
            allowTouchMove={false}
            speed={3000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              reverseDirection: t.reverse,
            }}
            onSwiper={(sw) => sw.autoplay.start()}
          >
            {trackProducts.map((p, i) => (
              <SwiperSlide className={s.productSlide} key={`${p.name}-${i}`}>
                <article className={s.productCard}>
                  <div className={s.productThumb}>
                    <span className={s.productAdd}>
                      <FiPlus aria-hidden="true" />
                    </span>
                  </div>
                  <div className={s.productInfo}>
                    <h3 className={s.productName}>{p.name}</h3>
                    <div className={s.productPrice}>
                      <strong>{p.price}</strong>
                      <span className={s.productMrp}>{p.mrp}</span>
                    </div>
                  </div>
                  <span className={s.productBadge}>{p.off} OFF</span>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        ))}
      </div>
    </section>
  );
}
