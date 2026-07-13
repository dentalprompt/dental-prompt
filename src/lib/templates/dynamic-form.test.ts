import { describe, expect, it } from "vitest";

import { buildDynamicSummary, parseDynamicTemplateFields, replaceContractVariables } from "./dynamic-form";

describe("parseDynamicTemplateFields", () => {
  it("parses JSON-based template fields", () => {
    const fields = parseDynamicTemplateFields(
      JSON.stringify([
        { label: "Alergias", type: "textarea", required: true },
        { label: "Fumante", type: "checkbox" }
      ])
    );

    expect(fields).toHaveLength(2);
    expect(fields[0]).toMatchObject({
      key: "alergias",
      label: "Alergias",
      type: "textarea",
      required: true
    });
    expect(fields[1]).toMatchObject({
      key: "fumante",
      type: "checkbox"
    });
  });

  it("parses line-based template fields with options", () => {
    const fields = parseDynamicTemplateFields(
      "Dor principal | type:text; required:true\nPlano | type:select; options:Particular,Convenio"
    );

    expect(fields).toHaveLength(2);
    expect(fields[0]).toMatchObject({
      key: "dor_principal",
      label: "Dor principal",
      type: "text",
      required: true
    });
    expect(fields[1]).toMatchObject({
      key: "plano",
      type: "select",
      options: ["Particular", "Convenio"]
    });
  });
});

describe("buildDynamicSummary", () => {
  it("builds a readable summary for mixed answer types", () => {
    const fields = parseDynamicTemplateFields(
      JSON.stringify([
        { key: "dor", label: "Dor", type: "text" },
        { key: "medicacoes", label: "Medicacoes", type: "multi_select", options: ["A", "B"] },
        { key: "fumante", label: "Fumante", type: "checkbox" }
      ])
    );

    const summary = buildDynamicSummary(fields, {
      dor: "Sensibilidade",
      medicacoes: ["A", "B"],
      fumante: false
    });

    expect(summary).toContain("Dor: Sensibilidade");
    expect(summary).toContain("Medicacoes: A, B");
    expect(summary).toContain("Fumante: Nao");
  });
});

describe("replaceContractVariables", () => {
  it("replaces known variables and keeps missing values explicit", () => {
    const rendered = replaceContractVariables(
      "Paciente: {{ nome_paciente }}\nPlano: {{ plano }}\nValor: {{ valor }}\nTelefone: {{ telefone }}",
      {
        nome_paciente: "Mariana",
        plano: "",
        valor: "R$ 1.200,00",
        telefone: undefined
      }
    );

    expect(rendered).toContain("Paciente: Mariana");
    expect(rendered).toContain("Plano: Nao informado");
    expect(rendered).toContain("Valor: R$ 1.200,00");
    expect(rendered).toContain("Telefone: Nao informado");
  });
});
