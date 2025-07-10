import { useEffect, useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useAnimation,
  useTransform,
} from "framer-motion";

interface Collection {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  image?: string;
  img?: string;
  thumbnail?: string;
  preview?: string;
  timestamp?: string; // Added timestamp for formatting
}

const RollingGallery = ({
  autoplay = false,
  pauseOnHover = false,
  collections = [],
}: {
  autoplay?: boolean;
  pauseOnHover?: boolean;
  collections?: Collection[];
}) => {
  // images prop will be used to fill the cards; if empty, cards will be empty

  const [isScreenSizeSm, setIsScreenSizeSm] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  );
  useEffect(() => {
    const handleResize = () => setIsScreenSizeSm(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set card width to a fixed value
  const faceWidth = 300;
  const faceCount = collections.length;
  // Calculate the radius so that the cards are spaced evenly and never shrink
  const radius = faceCount > 1 ? faceWidth / (2 * Math.tan(Math.PI / faceCount)) : 0;
  const cylinderWidth = faceCount * faceWidth;

  const dragFactor = 0.05;
  const rotation = useMotionValue(0);
  const controls = useAnimation();

  const transform = useTransform(
    rotation,
    (val) => `rotate3d(0,1,0,${val}deg)`
  );

  // Arrow navigation state
  const [activeIdx, setActiveIdx] = useState(0);
  // When activeIdx changes, rotate to the correct card
  useEffect(() => {
    if (faceCount === 0) return;
    const angle = -(360 / faceCount) * activeIdx;
    controls.start({
      rotateY: angle,
      transition: { type: 'spring', stiffness: 80, damping: 18 }
    });
  }, [activeIdx, faceCount, controls]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + faceCount) % faceCount);
  };
  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % faceCount);
  };

  const handleUpdate = (latest: any) => {
    if (typeof latest.rotateY === "number") {
      rotation.set(latest.rotateY);
    }
  };

  const handleDrag = (_: any, info: any) => {
    controls.stop();
    rotation.set(rotation.get() + info.offset.x * dragFactor);
  };

  const handleDragEnd = (_: any, info: any) => {
    const finalAngle = rotation.get() + info.velocity.x * dragFactor;
    rotation.set(finalAngle);

    if (autoplay) {
      // startInfiniteSpin(finalAngle); // This line is removed as per the edit hint
    }
  };

  const handleMouseEnter = () => {
    if (autoplay && pauseOnHover) {
      controls.stop();
    }
  };
  const handleMouseLeave = () => {
    if (autoplay && pauseOnHover) {
      const currentAngle = rotation.get();
      // startInfiniteSpin(currentAngle); // This line is removed as per the edit hint
    }
  };

  return (
    <div className="relative h-[500px] w-full overflow-hidden">

      <div className="flex h-full items-center justify-center [perspective:1000px] [transform-style:preserve-3d]">
        {/* Left Arrow */}
        {faceCount > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-[#23243a] hover:bg-[#7f5fff] text-white rounded-full p-2 shadow transition-colors"
            aria-label="Previous Collection"
            style={{ outline: 'none', border: 'none' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        )}
        {/* Right Arrow */}
        {faceCount > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-[#23243a] hover:bg-[#7f5fff] text-white rounded-full p-2 shadow transition-colors"
            aria-label="Next Collection"
            style={{ outline: 'none', border: 'none' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        )}
        <motion.div
          animate={controls}
          style={{
            transform: transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          className="flex min-h-[200px] items-center justify-center [transform-style:preserve-3d]"
        >
          {collections.map((col, i) => {
            const img = col.cover_image || col.image || col.img || col.thumbnail || col.preview || null;
            // Format timestamp if available
            let formattedTime = '';
            if (col.timestamp) {
              try {
                formattedTime = new Date(col.timestamp).toLocaleString();
              } catch {}
            }
            return (
              <div
                key={col.id || i}
                className="group absolute flex h-fit items-center justify-center p-[8%] [backface-visibility:hidden] md:p-[6%]"
                style={{
                  width: `${faceWidth}px`,
                  transform: `rotateY(${(360 / faceCount) * i}deg) translateZ(${radius}px)`,
                }}
              >
                <div className="flex flex-col w-[300px] h-[180px] rounded-[15px] border-[3px] border-white bg-[#23243a] overflow-hidden relative">
                  {/* Top: Name (now much larger) */}
                  <div className="flex items-center justify-center w-full h-[100px] bg-gradient-to-r from-[#23243a] to-[#181c2f] text-white text-3xl font-extrabold px-8 py-4 tracking-tight shadow-sm border-b-2 border-[#23243a] rounded-t-[12px] truncate">
                    {col.title}
                  </div>
                  {/* Middle: Image (if any) */}
                  {img && (
                    <img
                      src={img}
                      alt={col.title}
                      className="pointer-events-none h-[54px] w-full object-cover"
                    />
                  )}
                  {/* Bottom: Description and timestamp (now smaller) */}
                  <div className="flex flex-col justify-end px-4 py-1 w-full flex-1 min-h-0">
                    {col.description && <div className="text-[#b0b3c7] text-xs truncate mb-0.5" title={col.description}>{col.description}</div>}
                    {formattedTime && <div className="text-[#7f5fff] text-[10px] mt-0.5">{formattedTime}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default RollingGallery; 