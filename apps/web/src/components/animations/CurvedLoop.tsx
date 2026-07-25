import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface CurvedLoopProps {
  text: string;
  className?: string;
  radius?: number;
  duration?: number;
  repeat?: number;
  ease?: string;
}

export default function CurvedLoop({
  text,
  className = '',
  radius = 150,
  duration = 10,
  repeat = -1,
  ease = 'none',
}: CurvedLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.loop-char');
    const totalChars = chars.length;

    gsap.set(chars, {
      rotation: (i: number) => (i / totalChars) * 360,
      x: radius,
      transformOrigin: 'center center',
    });

    gsap.to(containerRef.current, {
      rotation: 360,
      duration,
      repeat,
      ease,
    });
  }, [text, radius, duration, repeat, ease]);

  return (
    <div ref={containerRef} className={className} style={{ display: 'inline-block' }}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="loop-char"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'pre',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
}
