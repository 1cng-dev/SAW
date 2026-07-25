import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines';
  from?: { opacity?: number; y?: number; x?: number };
  to?: { opacity?: number; y?: number; x?: number };
  threshold?: number;
  rootMargin?: string;
  textAlign?: string;
  onLetterAnimationComplete?: () => void;
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const elements = containerRef.current.querySelectorAll('.split-char, .split-word, .split-line');
    
    gsap.fromTo(
      elements,
      from,
      {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        onComplete: onLetterAnimationComplete,
      }
    );
  }, [isVisible, from, to, duration, ease, delay, onLetterAnimationComplete]);

  const splitContent = () => {
    if (splitType === 'chars') {
      return text.split('').map((char, index) => (
        <span key={index} className="split-char" style={{ display: 'inline-block', whiteSpace: 'pre' }}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    } else if (splitType === 'words') {
      return text.split(' ').map((word, index) => (
        <span key={index} className="split-word" style={{ display: 'inline-block', marginRight: '0.25em' }}>
          {word}
        </span>
      ));
    } else {
      return text.split('\n').map((line, index) => (
        <span key={index} className="split-line" style={{ display: 'block' }}>
          {line}
        </span>
      ));
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ textAlign: textAlign as any, overflow: 'hidden' }}
    >
      {splitContent()}
    </div>
  );
}
