"use client";

import { Label, Input, Textarea, Button } from "../components";

import React, { useState } from "react";

// Mock components for a form, as if from a UI library like ShadcnUI.
export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to an API route
    // For this example, we'll just log it to the console
    console.log("Form data submitted:", formData);

    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-background text-foreground">
      <main className="container max-w-lg py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground">
            Have a question about the platform? Let us know.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center p-8 rounded-xl border bg-card shadow-md">
            <h2 className="text-2xl font-semibold mb-2 text-green-500">
              Thank You!
            </h2>
            <p className="text-muted-foreground">
              Your message has been sent successfully. We will get back to you
              shortly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-8 rounded-xl border bg-card shadow-md"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message here..."
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
