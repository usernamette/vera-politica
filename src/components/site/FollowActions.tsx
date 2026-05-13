import { Star, BadgeCheck } from "lucide-react";
import { followStore, useFollowed, useMounted } from "@/lib/user-store";
import { cn } from "@/lib/utils";

type Props = {
  deputado: { id: number; nome: string; siglaPartido: string; siglaUf: string; urlFoto: string };
  size?: "sm" | "md";
  variant?: "icon" | "full";
};

export function FollowActions({ deputado, size = "sm", variant = "icon" }: Props) {
  const mounted = useMounted();
  const favs = useFollowed("favorite");
  const voted = useFollowed("voted");
  const isFav = mounted && favs.some((d) => d.id === deputado.id);
  const isVoted = mounted && voted.some((d) => d.id === deputado.id);

  const baseBtn =
    "inline-flex items-center justify-center gap-1.5 rounded-md border transition-all";
  const sizeCls = size === "sm" ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm";

  const handle = (e: React.MouseEvent, kind: "favorite" | "voted") => {
    e.preventDefault();
    e.stopPropagation();
    followStore.toggle(kind, deputado);
  };

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => handle(e, "favorite")}
        title={isFav ? "Remover dos favoritos" : "Favoritar"}
        aria-pressed={isFav}
        className={cn(
          baseBtn,
          sizeCls,
          isFav
            ? "border-warning/40 bg-warning/15 text-warning"
            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
        )}
      >
        <Star className={cn("h-3.5 w-3.5", isFav && "fill-current")} />
        {variant === "full" && <span>{isFav ? "Favoritado" : "Favoritar"}</span>}
      </button>
      <button
        type="button"
        onClick={(e) => handle(e, "voted")}
        title={isVoted ? "Remover marcação" : "Marcar como em quem votei"}
        aria-pressed={isVoted}
        className={cn(
          baseBtn,
          sizeCls,
          isVoted
            ? "border-success/40 bg-success/15 text-success"
            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
        )}
      >
        <BadgeCheck className={cn("h-3.5 w-3.5", isVoted && "fill-current/0")} />
        {variant === "full" && <span>{isVoted ? "Votei nele" : "Votei nele/nela"}</span>}
      </button>
    </div>
  );
}
