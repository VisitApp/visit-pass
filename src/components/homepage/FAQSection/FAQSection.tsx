import { faqs } from "@/constants";
import FAQ from "../../common/FAQ/FAQ";
import s from "./FAQSection.module.scss";

export default function FAQSection() {
  return (
    <section className={s.section}>
      <h2 className={s.title}>Frequently asked questions</h2>
      <p className={s.subtitle}>
        For any unanswered questions, reach out to our support team via email
      </p>

      <FAQ items={faqs} />
    </section>
  );
}
