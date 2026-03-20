import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { SharePackForm } from "@/components/share-pack-form";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildSharePackLinkOptions } from "@/lib/share-packs/resolve";

export default async function NewInternalSharePackPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const [editions, campaigns, impacts, dossiers, pautas, patterns] = await Promise.all([
    getPublishedEditorialEditions(),
    getPublishedCampaigns(),
    getPublishedImpacts(),
    getPublishedDossiers(),
    getPublishedEditorialItems(),
    getPublishedPatternReads(),
  ]);

  const options = buildSharePackLinkOptions({
    editions,
    campaigns,
    impacts,
    dossiers,
    pautas,
    patterns,
  });

  return (
    <Container className="intro-grid internal-page share-internal-new-page">
      <section className="hero internal-hero">
        <p className="eyebrow">novo pack</p>
        <h1 className="hero__title">Criar pacote de circulação.</h1>
        <p className="hero__lead">Escolha o conteúdo de origem, escreva a legenda e publique uma peça pronta para circular fora do site.</p>
        <div className="hero__actions">
          <Link href="/interno/compartilhar" className="button-secondary">
            Voltar à lista
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <SharePackForm options={options} />
      </section>
    </Container>
  );
}
