import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animationDuration?: number;
}

export function ScoreCircle({ 
  score, 
  size = 200, 
  strokeWidth = 12,
  animationDuration = 800 
}: ScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
      setAnimatedScore(score * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, [score, animationDuration]);

  const getScoreColor = () => {
    if (score >= 90) return "hsl(var(--success))";
    if (score >= 75) return "hsl(var(--low))";
    if (score >= 60) return "hsl(var(--medium))";
    if (score >= 40) return "hsl(var(--high))";
    return "hsl(var(--critical))";
  };

  const getLetterGrade = () => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  return (
    <div className="relative inline-flex items-center justify-center" data-testid="score-circle">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold" style={{ color: getScoreColor() }} data-testid="text-score">
          {Math.round(animatedScore)}
        </div>
        <div className="text-sm text-muted-foreground mt-1" data-testid="text-grade">
          Grade {getLetterGrade()}
        </div>
      </div>
    </div>
  );
}
