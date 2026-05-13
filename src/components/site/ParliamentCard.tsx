import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Deputado } from "@/lib/camara-api";
import { PartyBadge } from "./PartyBadge";
import { ArrowUpRight } from "lucide-react";

export function ParliamentCard({ deputado, index = 0 }: { deputado: Deputado; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.3) }}
    >
      <Link
        to="/parlamentares/$id"
        params={{ id: String(deputado.id) }}
        className="group relative block overflow-hidden rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:border-primary/40 hover:shadow-glow"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-primary opacity-0 transition-opacity group-hover:opacity-[0.06]" />
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
    </motion.div>
  );
}
