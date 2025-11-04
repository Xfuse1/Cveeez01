
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to CVEEEZ</h1>
          <p className="text-lg text-gray-600 mb-8">Your one-stop solution for career services.</p>
          <Link href="/ecommerce" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition">
            Browse Services
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
