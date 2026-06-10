import Image from "next/image";
import Calendar from "@/icons/Calendar.svg";
import Clock from "@/icons/Clock.svg";
import Discount from "@/icons/Discount.svg";
import { benefits } from "@/constants";
import s from "./Clinic.module.scss";

const benefitIcons = [Clock, Calendar, Discount];

export default function Clinic() {
  return (
    <section className={s.clinicSection}>
      <h2 className={s.title}>Access to Visit Clinic</h2>
      <Image
        className={s.heroImage}
        src="./images/VisitClinic.png"
        height={240}
        width={335}
        alt=""
      />
      <div className={s.benefitList}>
        {benefits.map((b, i) => (
          <div className={s.benefitCard} key={b.title}>
            {benefitIcons[i] && (
              <Image
                className={s.benefitIcon}
                src={benefitIcons[i]}
                alt=""
                width={32}
                height={32}
              />
            )}
            <div className={s.benefitText}>
              <h3 className={s.benefitTitle}>{b.title}</h3>
              {b.subtitle && (
                <p className={s.benefitSubtitle}>{b.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <h2 className={s.titleBottom}>
        No waiting, no billing,
        <br /> no hassles
      </h2>
    </section>
  );
}
