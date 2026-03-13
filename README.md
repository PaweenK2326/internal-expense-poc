# Internal Expense Claim System (PoC)

Next.js 16 (App Router) + Prisma + Shadcn/UI. Employees submit claims; Managers (L1) and C-Level (L2) approve. Dashboard shows KPIs and charts.

## Setup

1. **Environment**
   - Copy `.env.example` to `.env` and set `DATABASE_URL` (PostgreSQL).

2. **Database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Run**
   ```bash
   npm run dev
   ```

4. **Login (mock)**  
   Open [http://localhost:3000](http://localhost:3000). You are redirected to `/login`. Enter any email/name, choose **Role** (Employee, Manager, C-Level) and **Department**. First login creates the user.

## Getting Started (dev server)

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
