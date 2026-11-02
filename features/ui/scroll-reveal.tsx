'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from './cn';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children: React.ReactNode;
  readonly animation?: 'custom-rise' | 'custom-fade-in';
  readonly delayMs?: number;
}

/**
 * Accessible, zero-overhead IntersectionObserver wrapper.
 * Marks child elements visible with a sleek entrance animation once they enter viewport.
 */
export function ScrollReveal({
  children,
  className = '',
  animation = 'custom-rise',
  delayMs = 0,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If window or IntersectionObserver is not available, default to visible
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: '120px 0px 120px 0px' },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Safety fallback: ensure content becomes fully visible after short delay
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 400);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(className, isVisible ? animation : 'opacity-0')}
      style={{ animationDelay: isVisible && delayMs > 0 ? `${delayMs}ms` : undefined }}
      {...props}
    >
      {children}
    </div>
  );
}
