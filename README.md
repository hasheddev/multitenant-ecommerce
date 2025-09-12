# Funroad: Multi-Tenant E-Commerce Platform

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Project Overview](#project-overview)
2. 🚀 [Key Features](#key-features)
3. ⚙️ [Tech Stack](#tech-stack)
4. 🤸 [Quick Start](#quick-start)

## <a name="overview">🤖 Project Overview</a>

Funroad is a sophisticated multi-tenant e-commerce platform designed to empower merchants with their own customizable, independent online storefronts. The app is built to scale, allowing multiple vendors to manage their businesses under a single platform, complete with dedicated subdomains and a robust suite of tools, including an AI-powered chat assistant to streamline customer support. With features like automated payment processing, product management, and a comprehensive admin dashboard, Funroad provides a powerful, all-in-one solution for both platform owners and merchants.

<a name="features">🚀 Key Features</a>
VendorVerse is packed with a comprehensive set of features to support a full-fledged e-commerce ecosystem:

**AI Chat Assistant**: A real-time, AI-powered chat assistant helps users and merchants with queries, product recommendations, and support.

**Multi-tenant Architecture**: Securely host and manage multiple independent merchant storefronts within a single application instance.

**Vendor Subdomains**: Each merchant gets their own dedicated subdomain (e.g., merchant-name.vendorverse.com) for a professional, branded presence.

**Stripe Connect Integration**: Seamlessly handle payments and disbursements with Stripe Connect, ensuring a secure and reliable payment flow.

**Automatic Platform Fees**: Automatically deduct a pre-configured platform fee from each transaction, providing a built-in monetization model.

**Product Ratings & Reviews**: Customers can rate and review products, building trust and providing valuable feedback for merchants.

**User Purchase Library**: Customers can access a unified library of all their past purchases.

**Role-Based Access Control**: Differentiate user permissions for customers, merchants, and administrators to ensure secure and appropriate access to features.

**dmin & Merchant Dashboards**: Dedicated dashboards provide platform administrators and merchants with the tools they need to manage users, products, orders, and sales analytics.

**Payload CMS Backend**: A flexible and powerful Payload CMS serves as the backend, providing a robust content management system for all e-commerce data.

**Category & Product Filtering**: Users can easily browse and find products using advanced category and filter options.

**Search Functionality**: A powerful search feature allows customers to quickly find products and merchants.

**Image Upload Support**: Merchants can effortlessly upload and manage product images directly within the platform.

## <a name="tech-stack">⚙️ Tech Stack</a>

- Frontend:
  - React 19 & Next.js 15: For a fast, server-side rendered, and scalable application.
  - TypeScript: To ensure code quality and maintainability.
  - TailwindCSS: For rapid, utility-first styling.
  - Shadcn/UI: A collection of pre-built, accessible components.

- Backend:
  - Payload CMS: A powerful headless CMS built on TypeScript and Node.js using Mongodb.

- Tools & Services:
  - Stripe Connect: For secure payment processing.
  - Bun: A fast, all-in-one JavaScript toolkit and package manager.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [bun](https://bun.com/) (Javascript run time)

**Cloning the Repository**

```bash
git clone https://github.com/hasheddev/multitenant-ecommerce.git
cd multitenant-ecommerce
```

**Installation**

```bash
bun install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
PAYLOAD_SECRET45060
DATABASE_URI
GOOGLE_API_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_ROOT_DOMAIN
APP_URL
NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING="false"
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

Replace the values with your actual Mongodb, stripe and google cloud console credentials from [mongodb](https://www.mongodb.com/), strpe and google.

**Running the Project**

1.

```bash
bun run db:seed
bun run dev
```

2. create a new user from the app front end

3. replace the USER_NAME variable in seed-ai.ts with new user name

4.

```bash
    bun run db:seedai
```

The app will be available at http://localhost:3000 and the Payload CMS admin will be at http://localhost:3000/admin.
