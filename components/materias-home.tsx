import Link from "next/link";
import { getMaterias, publishedDate } from "@/lib/materias";

export async function MateriasHome() {
  const articles = (await getMaterias()).slice(0, 3);
  if (!articles.length) return null;
  return (
    <section className="section vr-pubs-home" aria-labelledby="vr-pubs-title">
      <div className="vr-pubs-heading">
        <div><p className="eyebrow">PUBLICADO NO SITE · VR ABANDONADA</p>
          <h2 id="vr-pubs-title">Matérias que ficam.</h2>
        </div>
        <Link href="/materias">Todas as matérias ↗</Link>
      </div>
      <div className="vr-pubs-grid">
        {articles.map((article, index) => (
          <article key={article.slug} className={"vr-pub-card" + (index === 0 ? " vr-pub-card--first" : "")}>
            <div className="vr-pub-card__meta">{article.section} · {publishedDate(article.publishedAt)}</div>
            <h3><Link href={"/materias/" + article.slug}>{article.title}</Link></h3>
            <p>{article.summary}</p>
            <Link href={"/materias/" + article.slug} className="vr-pub-card__more">Ler a matéria <span aria-hidden="true">↗</span></Link>
          </article>
        ))}
      </div>
    </section>
  );
}
