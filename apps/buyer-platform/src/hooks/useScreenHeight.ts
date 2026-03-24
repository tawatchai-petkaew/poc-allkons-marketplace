import { useEffect, useState } from 'react';

export function useScreenHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setHeight(window.innerHeight);
      handleResize(); // Set initial height
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return height;
}
