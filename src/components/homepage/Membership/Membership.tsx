import GoldCard from "../../common/GoldCard/GoldCard";
import s from "./Membership.module.scss";

export default function Membership() {
  return (
    <section className={s.membership}>
      <h2 className={s.title}>
        OPD Pass
        <br />
        Membership for you
      </h2>
      <GoldCard />
    </section>
  );
}
