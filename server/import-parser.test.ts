import { describe, expect, it } from "vitest";
import { parseImportRows } from "../shared/importParser";

describe("parseImportRows", () => {
  it("maps PDVs, chips, activations, paid plans and monthly results", () => {
    const result = parseImportRows(
      [
        { PDV: "Loja Centro", "Quantidade de chips": 10, Ativações: 3, "Plano pago": "Sim", Data: "03/09/2026" },
        { PDV: "Loja Centro", "Quantidade de chips": 4, Ativações: 2, "Plano pago": "Sim", Data: "04/09/2026" },
        { PDV: "Loja Norte", "Quantidade de chips": 7, Ativações: 1, "Plano pago": "Não", Data: "04/09/2026" },
      ],
      1,
    );

    expect(result.summary).toMatchObject({ clients: 3, pdvs: 2, chipsAllocated: 21, activations: 6, paidPdvs: 1 });
    expect(result.monthlyResults).toEqual([{ label: "Set", revenue: 31, activations: 6 }]);
  });

  it("accepts a sheet without optional columns", () => {
    const result = parseImportRows([{ Loja: "Loja Centro" }], 1);
    expect(result.summary).toMatchObject({ clients: 1, pdvs: 1, chipsAllocated: 0, chipsAvailable: null, activations: 0, paidPdvs: 0 });
    expect(result.monthlyResults).toEqual([]);
  });
});
