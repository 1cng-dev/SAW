import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ScrambledTextProps {
  text: string;
  className?: string;
  speed?: number;
  characters?: string;
  triggerOnHover?: boolean;
}

export default function ScrambledText({
  text,
  className = '',
  speed = 50,
  characters = '!<>-_\\/[]{}—=+*^?#________',
  triggerOnHover = false,
}: ScrambledTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scramble = (originalText: string) => {
    let iterations = 0;
    const maxIterations = originalText.length * 2;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setDisplayText(
        originalText
          .split('')
          .map((letter, index) => {
            if (index < iterations) {
              return originalText[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      iterations += 1 / 3;

      if (iterations >= maxIterations) {
        setDisplayText(originalText);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, speed);
  };

  useEffect(() => {
    if (!triggerOnHover) {
      scramble(text);
    }
  }, [text, triggerOnHover, speed, characters]);

  const handleMouseEnter = () => {
    if (triggerOnHover) {
      setIsHovering(true);
      scramble(text);
    }
  };

  const handleMouseLeave = () => {
    if (triggerOnHover) {
      setIsHovering(false);
    }
  };

  return (
    <span
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayText}
    </span>
  );
}
