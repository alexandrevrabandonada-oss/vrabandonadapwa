import Link from "next/link";
import { formattedDate, titleFor, topicsFor, type InstagramPost } from "@/lib/instagram/posts";

export function InstagramPublicationCard({ post, priority = false }: { post: InstagramPost; priority?: boolean }) {
  const title = titleFor(post);
  const labels = topicsFor(post);
  return (
    <article className={"ig-article" + (priority ? " ig-article--priority" : "")}>
      <Link href={"/publicacoes/" + post.id} className="ig-article__image-link" aria-label={"Ler: " + title}>
        {post.local_image ? (
          // Images are stored in this site's public directory by the importer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.local_image} alt={"Imagem da publicação: " + title} loading={priority ? "eager" : "lazy"} />
        ) : (
          <div className="ig-article__art"><span>VR</span><strong>ABANDONADA</strong><small>ACERVO DIGITAL</small></div>
        )}
        <span className="ig-article__kind">{post.media_type === "VIDEO" ? "REEL" : post.media_type === "CAROUSEL_ALBUM" ? "CARROSSEL" : "POST"}</span>
      </Link>
      <div className="ig-article__copy">
        <span className="ig-article__date">{formattedDate(post)}</span>
        <h3><Link href={"/publicacoes/" + post.id}>{title}</Link></h3>
        <p>{post.caption.replace(/\s+/g, " ").slice(0, 145)}{post.caption.length > 145 ? "…" : ""}</p>
        <div className="ig-article__topics">{labels.slice(0, 2).map((topic) => <span key={topic}>{topic}</span>)}</div>
      </div>
    </article>
  );
}
