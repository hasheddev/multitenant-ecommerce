"use client";

import Link from "next/link";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { MobileNavbar } from "./mobile-navbar";
import { useState } from "react";
import { MenuIcon } from "lucide-react";

interface NavBarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const NavBarItem = ({ href, children, isActive }: NavBarItemProps) => {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "bg-transparent rounded-full hover:bg-transparent hover:border-primary border-transparent px-3.5 text-lg",
        isActive && "bg-black text-white hover:bg-black hover:text-white"
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};

const navbarItems = [
  { href: "/", children: "Home" },
  { href: "/about", children: "About" },
  { href: "/features", children: "Features" },
  { href: "/pricing", children: "Pricing" },
  { href: "/contact", children: "Contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-white">
      <Link href="/" className="pl-6 flex items-center">
        <span className={cn("text-5xl font-semibold", poppins.className)}>
          funroad
        </span>
      </Link>
      <MobileNavbar
        open={isOpen}
        onOpenChange={setIsOpen}
        items={navbarItems}
      />
      <div className="items-center gap-4 hidden lg:flex">
        {navbarItems.map((item) => (
          <NavBarItem
            key={item.children}
            href={item.href}
            isActive={pathName === item.href}
          >
            {item.children}
          </NavBarItem>
        ))}
      </div>
      <div className="hidden lg:flex ">
        <Button
          asChild
          variant={"secondary"}
          className="border-l border-t-0 border-r-0 border-b-0 px-12 h-full rounded-none bg-white hover:bg-pink-400 transition-colors text-lg"
        >
          <Link prefetch href="/sign-in">
            {" "}
            Log in
          </Link>
        </Button>

        <Button
          asChild
          className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none text-white bg-black hover:bg-pink-400 hover:text-black transition-colors text-lg"
        >
          <Link prefetch href="/sign-up">
            Start Selling
          </Link>
        </Button>
      </div>
      <div className="flex lg:hidden items-center justify-center">
        <Button
          variant="ghost"
          className="size-12 border-transparent"
          onClick={() => setIsOpen(true)}
        >
          <MenuIcon />
        </Button>
      </div>
    </nav>
  );
};
