import { permanentRedirect } from "next/navigation";

/** /publicacoes era o arquivo automático da Meta, agora a porta editorial é /noticias.
 * Os permalinks antigos /publicacoes/[id] permanecem preservados. */
export default function PublicacoesLegado() {
  permanentRedirect("/noticias");
}
