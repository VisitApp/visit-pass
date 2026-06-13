import { clsx } from "@/utils/helpers";
import s from "./ProgressBar.module.scss";

type ProgressBarProps = {
  /** fill amount as a percentage, 0–100 */
  value: number;
  /** extra class on the track, e.g. for layout spacing */
  className?: string;
};

export default function ProgressBar({ value, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={clsx(s.track, className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className={s.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
