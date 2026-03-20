"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function NetworkStatusBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) {
    return null;
  }

  return (
    <div className="pwa-offline-banner" role="status" aria-live="polite">
      <span className="pwa-offline-banner__tag">offline</span>
      <p>Você está sem conexão. A leitura salva continua no aparelho e a última navegação pode estar disponível no cache.</p>
      <div className="pwa-offline-banner__actions">
        <Link href="/offline" className="button-secondary">
          Ver estado offline
        </Link>
        <Link href="/salvos" className="button-secondary">
          Abrir salvos
        </Link>
      </div>
    </div>
  );
}