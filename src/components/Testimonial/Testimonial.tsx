import styles from "./Testimonial.module.scss";

type TestimonialProps = {
  quote: string;
  name: string;
  /** e.g. "Project Manager • EY" */
  role: string;
  /** banner text, e.g. "saved ₹2500 on medicines & consultation" */
  savings?: string;
};

export default function Testimonial({
  quote,
  name,
  role,
  savings,
}: TestimonialProps) {
  return (
    <article className={styles.card}>
      <div className={styles.content}>
      <svg
        className={styles.quoteIcon}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="18"
        viewBox="0 0 24 18"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.26556 13.2334C0.75525 11.2693 0 9.15131 0 6.88088C0 4.94963 0.613125 3.32588 1.839 2.00962C3.06525 0.693187 4.43906 0.0339375 5.96194 0.0339375C7.20956 0.0339375 8.25412 0.426562 9.09506 1.20975C9.93469 1.992 10.3549 2.9295 10.3549 4.02C10.3549 5.01844 10.0084 5.86388 9.31612 6.55688C8.62294 7.24913 7.81163 7.59619 6.88088 7.59619C6.47175 7.59619 6.01762 7.51088 5.51831 7.34138C5.01862 7.17075 4.62113 7.0845 4.326 7.0845C4.03031 7.0845 3.78075 7.2435 3.57656 7.56244C3.34931 7.857 3.23681 8.40206 3.23681 9.19688C3.23681 10.5368 3.66712 11.7744 4.53 12.9109C5.39325 14.0453 6.82369 15.1356 8.82206 16.1799V17.5778C5.96194 16.6449 3.77494 15.1978 2.26556 13.2334ZM15.8929 13.3011C14.3713 11.337 13.6108 9.16294 13.6108 6.77906C13.6108 4.84781 14.2123 3.23663 15.4159 1.94156C16.6198 0.647437 17.9711 0 19.47 0C20.7403 0 21.8139 0.409125 22.6884 1.22625C23.5627 2.04338 24 3.00806 24 4.12181C24 5.09794 23.6528 5.92106 22.9607 6.591C22.2679 7.25981 21.4564 7.59619 20.5251 7.59619C20.0259 7.59619 19.5264 7.50506 19.0262 7.32375C18.5267 7.1415 18.1528 7.0515 17.9031 7.0515C17.6306 7.0515 17.3694 7.20956 17.1191 7.52831C16.869 7.84538 16.7447 8.32219 16.7447 8.95819C16.7447 10.3658 17.1077 11.5929 17.8342 12.6371C18.5619 13.6823 20.0713 14.8618 22.3646 16.1796V17.4748C19.5722 16.6566 17.4137 15.2655 15.8929 13.3011Z"
          fill="currentColor"
        />
      </svg>

      <p className={styles.quote}>{quote}</p>

      <div className={styles.author}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.role}>{role}</p>
      </div>
      </div>

      {savings && (
        <div className={styles.banner}>
          <p className={styles.bannerText}>{savings}</p>
        </div>
      )}
    </article>
  );
}
