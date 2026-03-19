import Link from "next/link";

import type { EditorialItem } from "@/lib/editorial/types";
import type { MemoryItem } from "@/lib/memory/types";

type Props = {
  memory: MemoryItem;
  relatedEditorial?: EditorialItem | null;
};

export function MemoryBridge({ memory, relatedEditorial }: Props) {
  return (
    <section className="section memory-bridge">
      <div className="grid-2">
        <div>
          <p className="eyebrow">Do arquivo para o presente</p>
          <h2>Uma memória puxa a pauta para fora do passado.</h2>
        </div>
        <p className="section__lead">
          O arquivo vivo não para no registro. Ele ajuda a entender o que continua acontecendo agora e por que isso importa.
        </p>
      </div>

      <div className="grid-2">
        <article className="support-box">
          <h3>Recorte de memória</h3>
          <p>{memory.excerpt}</p>
          <Link href={`/memoria/${memory.slug}`} className="button-secondary">
            Abrir memória
          </Link>
        </article>

        {relatedEditorial ? (
          <article className="support-box">
            <h3>Pauta conectada</h3>
            <p>{relatedEditorial.excerpt}</p>
            <Link href={`/pautas/${relatedEditorial.slug}`} className="button-secondary">
              Ler pauta atual
            </Link>
          </article>
        ) : (
          <article className="support-box">
            <h3>Pauta conectada</h3>
            <p>Sem pauta relacionada ainda. Quando o arquivo crescer, esta ponte ficará automática.</p>
          </article>
        )}
      </div>
    </section>
  );
}
