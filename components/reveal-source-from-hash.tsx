"use client";

import { useEffect } from "react";

/**
 * Quando o leitor chega pelo link "No acervo" de uma matéria,
 * expande a lista daquela apuração sem exigir uma segunda busca.
 * Respeita também trocas de hash feitas no próprio navegador.
 */
export function RevealSourceFromHash() {
  useEffect(() => {
    const reveal = () => {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      if (!/^fontes-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) return;
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) {
        target.open = true;
      }
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);

  return null;
}
