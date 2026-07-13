type EvolutionSendMessageInput = {
  number: string;
  text: string;
};

function buildEvolutionHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: process.env.EVOLUTION_API_KEY ?? ""
  };
}

export function isEvolutionConfigured() {
  return Boolean(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY && process.env.EVOLUTION_INSTANCE);
}

export async function sendEvolutionTextMessage({ number, text }: EvolutionSendMessageInput) {
  if (!isEvolutionConfigured()) {
    return { delivered: false, mode: "disabled" as const };
  }

  const endpoint = `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: buildEvolutionHeaders(),
    body: JSON.stringify({
      number,
      text
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || "Falha ao enviar mensagem pela Evolution API.");
  }

  const data = (await response.json()) as unknown;

  return {
    delivered: true,
    mode: "evolution" as const,
    data
  };
}

export async function getEvolutionInstanceStatus() {
  if (!isEvolutionConfigured()) {
    return { connected: false, mode: "disabled" as const };
  }

  const endpoint = `${process.env.EVOLUTION_API_URL}/instance/connectionState/${process.env.EVOLUTION_INSTANCE}`;
  const response = await fetch(endpoint, {
    headers: buildEvolutionHeaders(),
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || "Falha ao consultar a Evolution API.");
  }

  const data = (await response.json()) as { instance?: { state?: string } } | Record<string, unknown>;
  const state =
    "instance" in data && data.instance && typeof data.instance === "object" && "state" in data.instance
      ? String((data.instance as { state?: string }).state ?? "")
      : "";

  return {
    connected: state.toLowerCase() === "open",
    mode: "evolution" as const,
    state,
    data
  };
}
