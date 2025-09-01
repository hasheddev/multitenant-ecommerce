import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "../components";

const pricingTiers = [
  {
    name: "Starter",
    price: "Free",
    features: ["10 Product Listings", "Basic Storefront", "Community Support"],
  },
  {
    name: "Pro",
    price: "$29/mo",
    features: [
      "Unlimited Product Listings",
      "Customizable Storefront",
      "Stripe Connect Integration",
      "Analytics Dashboard",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "All Pro features",
      "Dedicated Account Manager",
      "API Access",
      "Priority Support",
    ],
  },
];

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
      <main className="container max-w-6xl py-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose a plan that scales with your business needs.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.highlight ? "border-primary" : ""}
            >
              <CardHeader className="text-center">
                <CardTitle>{tier.name}</CardTitle>
                <div className="text-4xl font-bold mt-2">{tier.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-2 text-muted-foreground">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className="text-primary mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button type="button" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
