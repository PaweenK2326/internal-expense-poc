export const QUERY_KEYS = {
  claims: {
    all: ["claims"] as const,
    list: (userId: string, role: string) =>
      ["claims", "list", userId, role] as const,
    detail: (id: string) => ["claims", "detail", id] as const,
  },
  dashboard: {
    summary: (userId: string, role: string) =>
      ["dashboard", "summary", userId, role] as const,
  },
} as const;
