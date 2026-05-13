import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Deputado } from "@/lib/camara-api";
import { PartyBadge } from "./PartyBadge";
import { FollowActions } from "./FollowActions";
import { ArrowUpRight } from "lucide-react";

export function ParliamentCard({ deputado, index = 0 }: { deputado: Deputado; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.3) }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all hover:border-primary/40 hover:shadow-glow"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-primary opacity-0 transition-opacity group-hover:opacity-[0.06]" />
      <Link
        to="/parlamentares/$id"
        params={{ id: String(deputado.id) }}
        className="block p-4"
      >
        <div className="flex items-start gap-3">
          <img
            src={deputado.urlFoto}
            alt={deputado.nome}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{deputado.nome}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <PartyBadge sigla={deputado.siglaPartido} />
              <span className="text-[11px] text-muted-foreground">·</span>
              <span className="text-[11px] font-medium text-muted-foreground">{deputado.siglaUf}</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Deputado(a) Federal</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </Link>
      <div className="border-t border-border/60 bg-background/40 px-4 py-2">
        <FollowActions deputado={deputado} />
      </div>
    </motion.div>
  );
}
