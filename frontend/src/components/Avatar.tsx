interface AvatarProps {
  src: string | null;
  alt: string;
  size?: number;
  fallback?: string;
}

export function Avatar({ src, alt, size = 32, fallback }: AvatarProps) {
  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full bg-surface-300 text-xs font-medium text-ink-900"
        aria-label={alt}
      >
        {fallback || alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
