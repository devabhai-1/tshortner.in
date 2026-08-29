import styles from './BrandMark.module.css';

/** Shared TShortner mark — uses generated brand assets. */
export default function BrandMark({ size = 40, className = '', alt = 'TShortner' }) {
  return (
    <img
      src="/favicon.svg"
      width={size}
      height={size}
      alt={alt}
      className={`${styles.mark} ${className}`.trim()}
      decoding="async"
    />
  );
}
