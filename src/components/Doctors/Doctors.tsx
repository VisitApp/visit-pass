import { doctors } from "@/constants";
import s from "./Doctors.module.scss";

export default function Doctors() {
  return (
    <section className={s.doctors}>
      <h2 className={s.doctorsTitle}>
        Meet our Doctors as many
        <br />
        times as you need
      </h2>
      <p className={s.doctorsSubtitle}>
        Unlock free unlimited doctor consultations and thorough lab tests for
        the whole year
      </p>

      <div className={s.stackWrap}>
        <span className={s.consultPill}>50% off on consultation</span>

        <div className={s.cardStack}>
          {doctors.map((doc) => (
            <article className={s.card} key={doc.name}>
              <span className={s.offBadge}>50% off</span>
              <span className={s.bookedTag}>Previously Booked</span>

              <div className={s.cardTop}>
                <div className={s.avatarWrap}>
                  <span className={s.avatar}>{doc.initials}</span>
                  <span className={s.yearsBadge}>{doc.years}</span>
                </div>
                <div className={s.info}>
                  <h3 className={s.cardName}>{doc.name}</h3>
                  <p className={s.specialty}>{doc.specialty}</p>
                  <p className={s.qualification}>{doc.qualification}</p>
                  <p className={s.clinic}>{doc.clinic}</p>
                </div>
              </div>

              <div className={s.priceRow}>
                <span className={s.paidBy}>Paid by VISIT</span>
                <span className={s.price}>
                  You Pay: <s className={s.priceOld}>{doc.priceOld}</s>{" "}
                  <strong className={s.priceNew}>{doc.priceNew}</strong>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
