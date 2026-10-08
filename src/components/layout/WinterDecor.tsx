import { useState } from 'react';
import { SNOWMAN_STAGES, Snowman } from '../eggs/Snowman';

type Flake = { top: number; left: number; size: number; opacity: number; inner: boolean };

// Deterministic "random" flakes, kept out of the centre so they don't sit on the title.
// "inner" flakes are hidden on phones, where the hero text spans almost the full width
// and the login hint sits right under the title.
const FLAKES: Flake[] = Array.from({ length: 40 }, (_, i) => {
  const top = 20 + ((i * 53) % 380);
  const left = 2 + ((i * 37) % 96);

  return {
    top,
    left,
    size: 3 + (i % 4) * 2,
    opacity: 0.35 + (i % 3) * 0.2,
    inner: (left > 8 && left < 93 && top > 40) || top > 230,
  };
}).filter((f) => !(f.left > 22 && f.left < 78 && f.top > 50));

export const Snowfall = () => (
  <div className="snow" aria-hidden="true">
    {FLAKES.map((f, i) => (
      <span
        key={i}
        className={f.inner ? 'snow__inner' : undefined}
        style={{ top: f.top, left: `${f.left}%`, width: f.size, height: f.size, opacity: f.opacity }}
      />
    ))}
  </div>
);

export const Snowdrift = () => {
  const [stage, setStage] = useState(0);
  const [waves, setWaves] = useState(0);

  const tap = () => (stage < SNOWMAN_STAGES ? setStage(stage + 1) : setWaves(waves + 1));

  return (
    <div className="snowdrift" onClick={tap}>
      <Snowman stage={stage} waves={waves} />
    </div>
  );
};
