import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
      <main className="container max-w-4xl py-12">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Our Mission
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We believe that modern, enterprise-level e-commerce tools should be
            accessible to everyone, from independent creators to large
            businesses. Our platform is built to make that a reality.
          </p>
        </section>

        {/* Narrative Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Solving the Subdomain Problem
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Many platforms force vendors into a single, generic page. Our
              multi-tenant architecture with **vendor subdomains** allows each
              merchant to have their own unique brand identity and URL, all
              powered by a single, scalable codebase. This gives them the
              freedom to grow while we handle the complexity.
            </p>
          </div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            {/* Using a placeholder SVG or a mock image to represent the concept */}
            <svg
              className="w-full h-full text-muted-foreground"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <rect
                x="10"
                y="20"
                width="80"
                height="60"
                rx="5"
                ry="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="35"
                y1="40"
                x2="65"
                y2="40"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="35"
                y1="50"
                x2="65"
                y2="50"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="35"
                y1="60"
                x2="65"
                y2="60"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="25"
                y="10"
                width="10"
                height="10"
                rx="2"
                ry="2"
                fill="currentColor"
              />
              <text
                x="50"
                y="30"
                fontSize="5"
                textAnchor="middle"
                fill="currentColor"
              >
                Domain 1
              </text>
              <rect
                x="55"
                y="70"
                width="10"
                height="10"
                rx="2"
                ry="2"
                fill="currentColor"
              />
              <text
                x="50"
                y="80"
                fontSize="5"
                textAnchor="middle"
                fill="currentColor"
              >
                Domain 2
              </text>
            </svg>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          {/* Card for the payments feature */}
          <Card>
            <CardHeader>
              <CardTitle>Stripe Connect Integration</CardTitle>
              <CardDescription>
                Seamless and secure payments with automated fees.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We&apos;ve built a robust payments system with Stripe Connect,
                ensuring that merchants get paid directly, while the
                platform&apos;s fees are handled automatically and
                transparently.
              </p>
            </CardContent>
          </Card>

          {/* Card for the CMS backend */}
          <Card>
            <CardHeader>
              <CardTitle>Flexible Content Management</CardTitle>
              <CardDescription>
                Managed with a headless CMS for content flexibility.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By leveraging a powerful headless CMS, we give our merchants
                full control over their content, from product listings to custom
                pages, without needing to touch code.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
