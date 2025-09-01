import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
      <main className="container max-w-4xl py-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Key Platform Features
          </h1>
          <p className="text-xl text-muted-foreground">
            A look at the technology and architecture that powers our platform.
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card for Architecture & Routing */}
          <Card>
            <CardHeader>
              <CardTitle>Core Architecture</CardTitle>
              <CardDescription>
                Scalable and modern web infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Multi-tenant architecture
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Vendor subdomains
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Built with Next.js 15
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card for E-commerce & Payments */}
          <Card>
            <CardHeader>
              <CardTitle>E-commerce & Payments</CardTitle>
              <CardDescription>
                Features for a seamless shopping experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Custom merchant storefronts
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Stripe Connect integration
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Automatic platform fees
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Product ratings & reviews
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  User purchase library
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card for User & Admin Management */}
          <Card>
            <CardHeader>
              <CardTitle>User & Admin Control</CardTitle>
              <CardDescription>
                Powerful tools for managing the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Role-based access control
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Admin dashboard
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Merchant dashboard
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card for Content & Data */}
          <Card>
            <CardHeader>
              <CardTitle>Content & Data</CardTitle>
              <CardDescription>
                A flexible system for all content types.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Payload CMS backend
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Category & product filtering
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Search functionality
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  Image upload support
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card for Design & Development */}
          <Card>
            <CardHeader>
              <CardTitle>Modern Tech Stack</CardTitle>
              <CardDescription>
                Styling and components for a sleek UI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  TailwindCSS V4 styling
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 mt-0.5">✓</span>
                  ShadcnUI components
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
