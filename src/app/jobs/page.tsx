import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function JobsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Job Listings</h1>
            <p className="text-lg text-muted-foreground">
                Our job portal is currently under construction. Please check back soon!
            </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
