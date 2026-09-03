export type MonthlyResult = { label: string; revenue: number; activations: number };

export type ImportSummary = {
  clients: number;
  pdvs: number;
  imports: number;
  success: number | null;
  chipsAllocated: number;
  chipsAvailable: number | null;
  activations: number;
  paidPdvs: number;
};

export const emptySummary: ImportSummary = {
  clients: 0,
  pdvs: 0,
  imports: 0,
  success: null,
  chipsAllocated: 0,
  chipsAvailable: null,
  activations: 0,
  paidPdvs: 0,
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  const text = String(value ?? "")
    .replace(/[^0-9,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Number(text) || 0;
};

const parseDate = (value: unknown) => {
  if (value instanceof Date) return value;
  if (typeof value === "number" && value > 20000) return new Date(Date.UTC(1899, 11, 30) + value * 86400000);
  const text = String(value ?? "").trim();
  const brDate = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (brDate) return new Date(Number(brDate[3].length === 2 ? `20${brDate[3]}` : brDate[3]), Number(brDate[2]) - 1, Number(brDate[1]));
  const date = new Date(text);
  return date;
};

export function parseImportRows(rows: Record<string, unknown>[], activationRate: number) {
  if (!rows.length) throw new Error("A planilha não possui linhas para importar.");
  const findKey = (candidates: string[]) =>
    Object.keys(rows[0]).find((key) => candidates.some((candidate) => normalize(key).includes(normalize(candidate))));
  const pdvKey = findKey(["pdv", "loja", "ponto de venda", "estabelecimento"]);
  const chipsKey = findKey(["chips deixados", "quantidade de chips", "quantidade chips", "quantidade chip", "chips alocados", "chips"]);
  const availableKey = findKey(["chips disponiveis", "estoque chips", "saldo chips"]);
  const activationsKey = findKey(["ativacoes", "ativacao"]);
  const statusKey = findKey(["plano pago", "status pagamento", "pagamento", "adimplente", "plano"]);
  const dateKey = findKey(["data", "mes", "periodo"]);
  const pdvValues = rows.map((row) => String(pdvKey ? row[pdvKey] : "").trim()).filter(Boolean);
  const pdvs = new Set(pdvValues).size || rows.length;
  const chipsAllocated = rows.reduce((total, row) => total + (chipsKey ? toNumber(row[chipsKey]) : 0), 0);
  const chipsAvailable = availableKey ? rows.reduce((total, row) => total + toNumber(row[availableKey]), 0) : null;
  const activations = rows.reduce((total, row) => total + (activationsKey ? toNumber(row[activationsKey]) : 0), 0);
  const paidPdvs = statusKey
    ? new Set(
        rows
          .filter((row) => ["sim", "ativo", "pago", "adimplente", "true"].some((word) => normalize(row[statusKey]).includes(word)))
          .map((row) => String(pdvKey ? row[pdvKey] : "").trim())
          .filter(Boolean),
      ).size
    : 0;
  const byMonth = new Map<number, { activations: number; pdvs: Set<string>; paidPdvs: Set<string> }>();
  rows.forEach((row) => {
    const date = parseDate(dateKey ? row[dateKey] : "");
    if (Number.isNaN(date.getTime())) return;
    const month = date.getMonth();
    const current = byMonth.get(month) || { activations: 0, pdvs: new Set<string>(), paidPdvs: new Set<string>() };
    current.activations += activationsKey ? toNumber(row[activationsKey]) : 0;
    const pdv = String(pdvKey ? row[pdvKey] : "").trim();
    if (pdv) {
      current.pdvs.add(pdv);
      if (statusKey && ["sim", "ativo", "pago", "adimplente", "true"].some((word) => normalize(row[statusKey]).includes(word))) current.paidPdvs.add(pdv);
    }
    byMonth.set(month, current);
  });
  const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthlyResults = Array.from(byMonth.entries())
    .sort(([a], [b]) => a - b)
    .map(([month, item]) => ({ label: labels[month], activations: item.activations, revenue: item.pdvs.size * 10 + item.activations * Math.max(0, activationRate) + item.paidPdvs.size * 5 }));
  return {
    summary: { clients: rows.length, pdvs, imports: 1, success: 100, chipsAllocated, chipsAvailable, activations, paidPdvs },
    monthlyResults,
  };
}
