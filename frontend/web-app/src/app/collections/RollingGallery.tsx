import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
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

const RollingGallery = forwardRef(({
  autoplay = false,
  pauseOnHover = false,
  collections = [],
  onRequestRemoveCollection,
  onCardClick,
}: {
  autoplay?: boolean;
  pauseOnHover?: boolean;
  collections?: Collection[];
  onRequestRemoveCollection?: (collectionId: string) => void;
  onCardClick?: (collectionId: string) => void;
}, ref) => {
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
  const faceWidth = 320;
  const faceGap = 1; // smaller gap in px between cards
  const faceCount = collections.length;
  // Use a fixed radius so card size and gap never change visually
  const radius = 500; // px, more compact
  const angle = faceCount > 0 ? 360 / faceCount : 0;
  const cylinderWidth = faceCount * faceWidth + (faceCount * faceGap);

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

  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [targetCollection, setTargetCollection] = useState<Collection | null>(null);

  useImperativeHandle(ref, () => ({
    prev: handlePrev,
    next: handleNext,
    setActiveIdx: setActiveIdx,
  }));

  return (
    <div className="relative h-[500px] w-full overflow-hidden">

      <div className="flex h-full items-center justify-center [perspective:1000px] [transform-style:preserve-3d]">
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
                  transform: `rotateY(${angle * i}deg) translateZ(${radius}px)`,
                  cursor: onCardClick ? 'pointer' : undefined,
                }}
                onClick={() => onCardClick && col.id && onCardClick(col.id)}
              >
                <div className="flex flex-col w-[220px] h-[110px] rounded-[15px] border-[3px] border-white bg-[#23243a] overflow-hidden relative">
                  {/* Remove (X) button */}
                  <button
                    className="absolute top-2 right-2 z-10 text-[#ff6b6b] hover:text-white text-lg font-bold bg-transparent border-none outline-none"
                    onClick={e => { e.stopPropagation(); setTargetCollection(col); setShowRemovePopup(true); }}
                    aria-label="Remove Collection"
                  >×</button>
                  {/* Top: Name */}
                  <div className="flex items-center justify-center w-full h-[48px] bg-gradient-to-r from-[#23243a] to-[#181c2f] text-white text-lg font-extrabold px-3 py-2 tracking-tight shadow-sm border-b-2 border-[#23243a] rounded-t-[12px] truncate">
                    {col.title}
                  </div>
                  {/* Middle: Image (if any) */}
                  {img && (
                    <img
                      src={img}
                      alt={col.title}
                      className="pointer-events-none h-[32px] w-full object-cover"
                    />
                  )}
                  {/* Bottom: Description and timestamp (now smaller) */}
                  <div className="flex flex-col justify-end px-2 py-1 w-full flex-1 min-h-0">
                    {col.description && <div className="text-[#b0b3c7] text-xs truncate mb-0.5" title={col.description}>{col.description}</div>}
                    {formattedTime && <div className="text-[#7f5fff] text-[10px] mt-0.5">{formattedTime}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Remove confirmation popup */}
      {showRemovePopup && targetCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl flex flex-col gap-6 min-w-[340px] max-w-[90vw] w-full max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-[#7f5fff] hover:text-white text-2xl font-bold"
              onClick={() => setShowRemovePopup(false)}
            >×</button>
            <span className="text-white text-lg font-bold mb-2">Remove Collection</span>
            <div className="text-[#b0b3c7] text-base">
              Are you sure you want to remove <span className="text-[#7f5fff] font-semibold">{targetCollection.title}</span>?
            </div>
            <div className="flex gap-4 justify-end mt-4">
              <button
                className="rounded-xl px-6 py-2 bg-[#ff6b6b] text-white font-semibold shadow hover:bg-[#ff4b4b] transition-colors"
                onClick={() => {
                  setShowRemovePopup(false);
                  if (onRequestRemoveCollection) onRequestRemoveCollection(targetCollection.id);
                }}
              >Remove</button>
              <button
                className="rounded-xl px-6 py-2 bg-[#23243a] border border-[#7f5fff] text-[#7f5fff] font-semibold shadow hover:bg-[#181c2f] transition-colors"
                onClick={() => setShowRemovePopup(false)}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default RollingGallery; 