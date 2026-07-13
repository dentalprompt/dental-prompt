export type DynamicTemplateField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "checkbox" | "radio" | "select" | "multi_select";
  options: string[];
  required: boolean;
};

function slugifyKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

export function parseDynamicTemplateFields(source: string | null | undefined): DynamicTemplateField[] {
  if (!source?.trim()) {
    return [];
  }

  const raw = source.trim();

  try {
    const parsed = JSON.parse(raw) as Array<Partial<DynamicTemplateField>>;

    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => item.label)
        .map((item, index) => ({
          key: item.key?.trim() || slugifyKey(item.label || `campo_${index + 1}`),
          label: item.label?.trim() || `Campo ${index + 1}`,
          type: item.type || "text",
          options: Array.isArray(item.options) ? item.options.map((option) => String(option)) : [],
          required: Boolean(item.required)
        }));
    }
  } catch {
    // fallback para sintaxe em linhas
  }

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [labelPart, configPart = ""] = line.split("|").map((item) => item.trim());
      const configEntries = Object.fromEntries(
        configPart
          .split(";")
          .map((entry) => entry.trim())
          .filter(Boolean)
          .map((entry) => {
            const [key, value = ""] = entry.split(":").map((piece) => piece.trim());
            return [key, value];
          })
      );

      const type = (configEntries.type as DynamicTemplateField["type"] | undefined) || "text";
      const options =
        configEntries.options?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];

      return {
        key: slugifyKey(configEntries.key || labelPart || `campo_${index + 1}`),
        label: labelPart || `Campo ${index + 1}`,
        type,
        options,
        required: configEntries.required === "true"
      };
    });
}

export function buildDynamicSummary(fields: DynamicTemplateField[], answers: Record<string, unknown>) {
  return fields
    .map((field) => {
      const value = answers[field.key];

      if (Array.isArray(value)) {
        return `${field.label}: ${value.join(", ")}`;
      }

      if (typeof value === "boolean") {
        return `${field.label}: ${value ? "Sim" : "Nao"}`;
      }

      return `${field.label}: ${String(value ?? "Nao informado")}`;
    })
    .join("\n");
}

export function replaceContractVariables(
  content: string,
  variables: Record<string, string | number | null | undefined>
) {
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value === null || value === undefined || value === "" ? "Nao informado" : String(value);
  });
}
