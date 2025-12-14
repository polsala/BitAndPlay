import { STEPS_PER_BAR } from "@/types/project";

interface Props {
  bars: number;
  stepWidth: number;
}

export const TimelineRuler = ({ bars, stepWidth }: Props) => {
  const totalSteps = bars * STEPS_PER_BAR;
  return (
    <div
      className="flex h-10 select-none border-b border-border/60 bg-gradient-to-r from-[#101420]/80 to-[#0e121b]/80 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
      style={{ width: totalSteps * stepWidth }}
    >
      {Array.from({ length: bars }, (_, bar) => (
        <div
          key={`bar-${bar}`}
          className="relative flex"
          style={{ width: STEPS_PER_BAR * stepWidth }}
        >
          <div className="absolute left-2 top-1 text-xs text-foreground/80">Bar {bar + 1}</div>
          <div className="flex h-full w-full">
            {Array.from({ length: 4 }, (_, beat) => (
              <div
                key={`beat-${bar}-${beat}`}
                className="relative flex-1 border-l border-border/50"
                style={{ width: stepWidth * 4 }}
              >
                <div className="absolute bottom-1 left-1 text-[10px] opacity-60">{beat + 1}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
