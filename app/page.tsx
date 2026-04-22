import { OfertaForm } from "@/components/oferta-form";

export default function Home() {
  return (
    <section className="container py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Nova Oferta</h2>
        <p className="text-sm text-muted-foreground">
          Preencha os dados abaixo para registrar uma nova oferta de commodity.
        </p>
      </div>

      <OfertaForm />
    </section>
  );
}
