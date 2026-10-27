import Link from "next/link";
import { InstagramPublicationCard } from "@/components/instagram-publication-card";
import { getInstagramPosts } from "@/lib/instagram/posts";

export function InstagramHomePanel() {
  const posts = getInstagramPosts().slice(0, 6);
  if (!posts.length) return null;
  return (
    <section className="section ig-homepanel" aria-labelledby="ig-home-heading">
      <div className="ig-homepanel__header">
        <div><p className="eyebrow">PUBLICAÇÕES · DIRETO DO INSTAGRAM</p><h2 id="ig-home-heading">O que a cidade está discutindo</h2></div>
        <Link href="/publicacoes">Ver todas as publicações ↗</Link>
      </div>
      <div className="ig-cards">{posts.map((post, i) => <InstagramPublicationCard key={post.id} post={post} priority={i === 0} />)}</div>
    </section>
  );
}
