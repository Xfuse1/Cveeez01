"use client";

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ecommerce pages are public - no authentication required
  return <>{children}</>;
}
