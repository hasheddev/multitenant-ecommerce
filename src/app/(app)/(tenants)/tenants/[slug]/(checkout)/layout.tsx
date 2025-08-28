import { ReactNode } from "react";

import Footer from "@/modules/tenants/ui/components/footer";
import Navbar from "@/modules/checkout/ui/components/navbar";

interface Props {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

const Layout = async ({ children, params }: Props) => {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-[#f4f4f0] flex flex-col">
      <Navbar slug={slug} />
      <div className="flex-1">
        <div className="max-w-(--breakpoint-xl) mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
