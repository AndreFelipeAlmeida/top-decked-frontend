import React, { useState } from "react";

export function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>
) {
  const [didError, setDidError] = useState(false);

  const { src, alt, style, className, ...rest } = props;

  const initials = alt
    ? alt
        .trim()
        .split(" ")
        .map((word) => word[0]?.toUpperCase())
        .slice(0, 2)
        .join("")
    : "?";

  const isInvalidSrc =
    !src || src === "null" || src === "undefined" || src.trim() === "";

  const shouldShowFallback = isInvalidSrc || didError;

  if (shouldShowFallback) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-300 text-gray-700 font-semibold ${className}`}
        style={style}
      >
        <span className="text-4xl select-none leading-none">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}