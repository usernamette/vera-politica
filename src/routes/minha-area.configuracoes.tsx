import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Save, ShieldCheck } from "lucide-react";
import { useUser, usePreferences, prefsStore, auth } from "@/lib/user-store";

export const Route = createFileRoute("/minha-area/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Brasil à Vera" }] }),
  component: ConfigPage,
});

const TEMAS = ["Educação","Saúde","Segurança","Economia","Meio ambiente","Direitos humanos","Transporte","Trabalho"];

function ConfigPage() {
  const user = useUser();
  const prefs = usePreferences();
  const [name, setName] = useState(prefs.displayName || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => { setName(prefs.displayName || user?.name || ""); setEmail(user?.email || ""); }, [user, prefs.displayName]);

  const togglePref = (k: keyof typeof prefs) => prefsStore.set({ [k]: !prefs[k] } as any);
  const toggleTema = (t: string) => {
    const set = new Set(prefs.temas);
    set.has(t) ? set.delete(t) : set.add(t);
    prefsStore.set({ temas: Array.from(set) });
  };
  const saveProfile = () => {
    if (user) auth.login(email, name);
    prefsStore.set({ displayName: name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personalize sua experiência de acompanhamento.</p>
      </header>

      <Section title="Perfil" description="Informações básicas usadas na sua área pessoal.">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nome">
            <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/40" />
          </Field>
          <Field label="E-mail">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/40" />
          </Field>
        </div>
        <button onClick={saveProfile} className="mt-4 inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
          <Save className="h-4 w-4" /> {saved ? "Salvo!" : "Salvar perfil"}
        </button>
      </Section>

      <Section title="Preferências de acompanhamento" description="Escolha o que você quer receber em seus alertas.">
        <div className="grid gap-2 md:grid-cols-2">
          <Toggle label="Receber alertas sobre votações" checked={prefs.alertVotacoes} onChange={() => togglePref("alertVotacoes")} />
          <Toggle label="Receber alertas sobre gastos" checked={prefs.alertGastos} onChange={() => togglePref("alertGastos")} />
          <Toggle label="Receber alertas sobre proposições" checked={prefs.alertProposicoes} onChange={() => togglePref("alertProposicoes")} />
          <Toggle label="Receber alertas sobre divergências" checked={prefs.alertDivergencias} onChange={() => togglePref("alertDivergencias")} />
        </div>
      </Section>

      <Section title="Temas de interesse" description="Os temas escolhidos serão priorizados nas análises.">
        <div className="flex flex-wrap gap-2">
          {TEMAS.map((t) => {
            const active = prefs.temas.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTema(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Privacidade" description="" icon={<ShieldCheck className="h-4 w-4 text-success" />}>
        <p className="text-sm text-muted-foreground">
          Por enquanto, seus acompanhamentos são salvos apenas neste navegador. Nenhum dado é enviado para servidores externos.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, description, children, icon }: { title: string; description?: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">{icon}{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3 text-left text-sm transition-colors hover:border-primary/30"
    >
      <span>{label}</span>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-gradient-primary" : "bg-muted"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
