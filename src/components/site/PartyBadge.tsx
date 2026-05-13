import { cn } from "@/lib/utils";

const PARTY_HUE: Record<string, number> = {
  PT: 12, PL: 245, PSDB: 220, MDB: 145, PP: 35, UNIAO: 200, REPUBLICANOS: 280,
  PSD: 195, PDT: 5, PSB: 165, PCdoB: 18, NOVO: 185, PSOL: 320, REDE: 140,
  CIDADANIA: 30, PV: 150, AVANTE: 260, PODE: 50, PRD: 295, SOLIDARIEDADE: 25,
};

export function PartyBadge({ sigla, className }: { sigla: string; className?: string }) {
  const hue = PARTY_HUE[sigla.toUpperCase()] ?? Math.abs(sigla.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        className
      )}
      style={{
        background: `oklch(0.3 0.08 ${hue} / 0.25)`,
        borderColor: `oklch(0.5 0.15 ${hue} / 0.35)`,
        color: `oklch(0.85 0.12 ${hue})`,
      }}
    >
      {sigla}
    </span>
  );
}
