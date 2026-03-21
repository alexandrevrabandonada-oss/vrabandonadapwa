"use client";

export function ReadingAssistantTrigger({ className = "button-secondary" }: { className?: string }) {
  const openAssistant = () => {
    window.dispatchEvent(new CustomEvent("vr:open-reading-assistant"));
  };

  return (
    <button
      type="button"
      className={className}
      onClick={openAssistant}
      aria-label="Abrir leitura assistida e modo baixa visão"
    >
      Ouvir
    </button>
  );
}
