// Easter egg: each tap on the snowdrift adds a ball; the finished snowman waves on every next tap

export const SNOWMAN_STAGES = 3;

type Props = { stage: number; waves: number };

export const Snowman = ({ stage, waves }: Props) => {
  if (stage === 0) return null;

  const done = stage >= SNOWMAN_STAGES;

  return (
    <div className="snowman" aria-hidden="true">
      <span className="snowman__ball snowman__ball--base" />
      {stage >= 2 && <MiddleBall done={done} waves={waves} />}
      {done && <Head />}
    </div>
  );
};

const MiddleBall = ({ done, waves }: { done: boolean; waves: number }) => (
  <span className="snowman__ball snowman__ball--middle">
    {done && (
      <>
        <span className="snowman__scarf" />
        <span className="snowman__arm snowman__arm--left" />
        {/* key restarts the wave animation on every tap */}
        <span key={waves} className="snowman__arm snowman__arm--right" />
      </>
    )}
  </span>
);

const Head = () => (
  <span className="snowman__ball snowman__ball--head">
    <span className="snowman__eye snowman__eye--left" />
    <span className="snowman__eye snowman__eye--right" />
    <span className="snowman__nose" />
  </span>
);
