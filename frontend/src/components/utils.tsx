import { ImgHTMLAttributes, useState } from "react";

// Define the props interface to include all img props and src, fallbackSrc
interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc: string;
}

export function ImageWithFallback({ 
  src, 
  fallbackSrc,
  ...rest
}) {
  const [isError, setIsError] = useState(false);

  return (
    <img
      src={isError ? fallbackSrc : (src || fallbackSrc)}
      onError={() => setIsError(true)}
      {...rest}
    />
  );
}
  