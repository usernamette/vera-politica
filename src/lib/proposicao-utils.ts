// Heurísticas para transformar dados crus da Câmara em UI mais humana.

export const TEMAS = [
  { codTema: 40, label: "Economia", emoji: "💰" },
  { codTema: 37, label: "Educação", emoji: "📚" },
  { codTema: 34, label: "Saúde", emoji: "🏥" },
  { codTema: 53, label: "Segurança", emoji: "🛡️" },
  { codTema: 48, label: "Meio ambiente", emoji: "🌱" },
  { codTema: 62, label: "Transporte", emoji: "🚌" },
  { codTema: 39, label: "Impostos", emoji: "🧾" },
  { codTema: 46, label: "Direitos humanos", emoji: "✊" },
] as const;

export type TemaChip = (typeof TEMAS)[number];

export const TIPOS = [
  { value: "", label: "Todos os tipos" },
  { value: "PL", label: "Projeto de Lei (PL)" },
  { value: "PEC", label: "Emenda Constitucional (PEC)" },
  { value: "PLP", label: "Lei Complementar (PLP)" },
  { value: "MPV", label: "Medida Provisória (MPV)" },
  { value: "PDC", label: "Decreto Legislativo (PDC)" },
  { value: "PRC", label: "Resolução (PRC)" },
] as const;

export type StatusKind = "tramitando" | "aprovado" | "arquivado" | "rejeitado" | "urgente" | "indef";

export function inferStatus(desc?: string | null): { kind: StatusKind; label: string } {
  const d = (desc ?? "").toLowerCase();
  if (!d) return { kind: "indef", label: "Sem situação" };
  if (d.includes("arquivad")) return { kind: "arquivado", label: "Arquivado" };
  if (d.includes("rejeit")) return { kind: "rejeitado", label: "Rejeitado" };
  if (d.includes("aprovad") || d.includes("transformado") || d.includes("sancion")) return { kind: "aprovado", label: "Aprovado" };
  if (d.includes("urgência") || d.includes("urgencia")) return { kind: "urgente", label: "Urgência" };
  return { kind: "tramitando", label: "Em tramitação" };
}

export function statusBadgeClasses(kind: StatusKind): string {
  switch (kind) {
    case "aprovado": return "border-success/40 bg-success/15 text-success";
    case "arquivado": return "border-border bg-muted text-muted-foreground";
    case "rejeitado": return "border-destructive/40 bg-destructive/15 text-destructive";
    case "urgente": return "border-warning/40 bg-warning/15 text-warning";
    case "tramitando": return "border-info/40 bg-info/15 text-info";
    default: return "border-border bg-secondary text-muted-foreground";
  }
}

// Tornar a ementa mais legível: corta longas, acrescenta reticências, capitaliza primeira letra.
export function humanize(ementa: string): string {
  const t = ementa.trim().replace(/\s+/g, " ");
  const cap = t.charAt(0).toUpperCase() + t.slice(1);
  return cap.length > 240 ? cap.slice(0, 237).trimEnd() + "…" : cap;
}

// Resumo curto estilo "Projeto que altera regras sobre…"
export function shortHook(ementa: string): string {
  const t = ementa.replace(/\s+/g, " ").trim();
  // remove "Dispõe sobre", "Altera a Lei", etc.
  const cleaned = t
    .replace(/^disp[oõ]e\s+sobre\s+/i, "Define regras sobre ")
    .replace(/^altera\s+/i, "Altera ")
    .replace(/^institui\s+/i, "Cria ")
    .replace(/^cria\s+/i, "Cria ")
    .replace(/^revoga\s+/i, "Revoga ")
    .replace(/^acrescenta\s+/i, "Adiciona ")
    .replace(/^modifica\s+/i, "Altera ");
  const first = cleaned.split(/[.;]/)[0];
  return first.length > 140 ? first.slice(0, 137).trimEnd() + "…" : first;
}
