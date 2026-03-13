import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Docs | Internal Expense Claim",
  description: "Swagger UI for the Internal Expense Claim API.",
};

export default function SwaggerPage() {
  return (
    <main className="h-screen w-full">
      <iframe
        src="/swagger.html"
        title="Swagger UI"
        className="h-full w-full border-0"
      />
    </main>
  );
}

