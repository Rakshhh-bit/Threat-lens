import React, { useEffect, useRef, useState } from "react";

function RevealOnScroll({
  children,
  className = "",
  style = {},
  threshold = 0.12,
  rootMargin = "0px 0px -50px 0px",
  delay = 0,
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const currentRef = domRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          // Once revealed, disconnect to prevent re-triggering
          observer.unobserve(currentRef);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  return (
    <div
      ref={domRef}
      className={`reveal-on-scroll ${isRevealed ? "is-revealed" : ""} ${className}`}
      style={{
        ...style,
        ...(delay ? { transitionDelay: `${delay}ms` } : {}),
      }}
    >
      {children}
    </div>
  );
}

export default RevealOnScroll;
