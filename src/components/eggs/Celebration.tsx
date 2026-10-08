import { useEffect, useState, type CSSProperties } from 'react';
import maksPhoto from '../../../static/maks.jpg';

// Easter egg: tap the header star AGE times — a gift box opens and Maks's photo pops out
export const BIRTHDAY_AGE = 5;

// Bundled by Vite (hashed file name in dist). Set to an empty string to show a placeholder instead.
const PHOTO_URL: string = maksPhoto;

const DURATION_MS = 5500;
const COLORS = ['var(--red)', 'var(--gold)', 'var(--green)', '#8fb8ff', '#ffffff'];

// Start downloading the photo right away, so it's ready by the time the box opens
if (PHOTO_URL) new Image().src = PHOTO_URL;

type Piece = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  color: string;
  round: boolean;
};

// Confetti starts falling when the lid comes off (~1.2s). Every third piece is a round snowflake.
const makePieces = (): Piece[] =>
  Array.from({ length: 70 }, (_, i) => ({
    left: Math.random() * 100,
    delay: 1.2 + Math.random() * 1.2,
    duration: 2.4 + Math.random() * 1.6,
    size: 6 + Math.random() * 8,
    drift: (Math.random() - 0.5) * 140,
    color: COLORS[i % COLORS.length],
    round: i % 3 === 0,
  }));

const pieceStyle = (p: Piece) =>
  ({
    left: `${p.left}%`,
    width: p.size,
    height: p.round ? p.size : p.size * 0.5,
    background: p.color,
    borderRadius: p.round ? '50%' : 2,
    animationDelay: `${p.delay}s`,
    animationDuration: `${p.duration}s`,
    '--drift': `${p.drift}px`,
  }) as CSSProperties;

export const Celebration = ({ onDone }: { onDone: () => void }) => {
  const [pieces] = useState(makePieces);

  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="celebration" role="status" aria-label={`Максу ${BIRTHDAY_AGE}!`}>
      {pieces.map((p, i) => (
        <span key={i} className="celebration__piece" style={pieceStyle(p)} />
      ))}
      <GiftBox />
    </div>
  );
};

const GiftBox = () => (
  <div className="giftbox">
    <span className="giftbox__glow" />
    <span className="giftbox__photo">
      {PHOTO_URL ? <img src={PHOTO_URL} alt="" /> : <span className="giftbox__placeholder">🎂</span>}
    </span>
    <span className="giftbox__box">
      <span className="giftbox__lid" />
      <span className="giftbox__body" />
    </span>
  </div>
);
