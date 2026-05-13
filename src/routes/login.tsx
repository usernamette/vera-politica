import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import { auth } from "@/lib/user-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Brasil à Vera" },
      { name: "description", content: "Acesse sua área pessoal para acompanhar parlamentares." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) return;
    auth.login(email.trim(), mode === "signup" ? name : undefined);
    navigate({ to: "/minha-area" });
  };

  return (
    <div className="relative mx-auto flex min-h-[80vh] max-w-md items-center px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-hero" />
      <div className="w-full">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Sua área</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
            </h1>
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Acompanhe durante o ano o trabalho dos políticos que você votou ou favoritou.
        </p>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          {mode === "signup" && (
            <Field label="Nome">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como devemos te chamar?"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
          )}
          <Field label="E-mail" icon={<Mail className="h-4 w-4" />}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>
          <Field label="Senha" icon={<Lock className="h-4 w-4" />}>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>

          <button
            type="submit"
            className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01]"
          >
            {mode === "login" ? "Entrar" : "Criar conta"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full rounded-md border border-border bg-secondary/50 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {mode === "login" ? "Criar conta" : "Já tenho uma conta"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Esta é uma área de demonstração. Seus dados ficam salvos apenas neste navegador.
        </p>
        <p className="mt-3 text-center text-xs">
          <Link to="/" className="text-muted-foreground hover:text-foreground">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        {children}
      </div>
    </label>
  );
}
