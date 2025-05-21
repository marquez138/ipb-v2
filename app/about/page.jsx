'use client';
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Profile Section */}
      <section className="bg-[#f1f1f1] py-16 px-6 rounded-lg mb-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Gabriel Sebastian Santoso</h1>
            <p className="text-gray-700 text-lg mb-1">Universitas Sriwijaya</p>
            <p className="text-gray-700 text-lg">Fakultas Ilmu Komputer, Jurusan Sistem Informasi</p>
            <p className="text-gray-600 text-sm mt-2">NIM: 09031382328173</p>
          </div>
          <div className="flex-shrink-0">
            <img
              src={assets.pp_image} // Ganti dengan URL foto kamu
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>
        </div>
      </section>

      {/* About QuickCart */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-semibold mb-4">Tentang QuickCart</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          QuickCart merupakan platform e-commerce modern yang dikembangkan dengan stack teknologi seperti Next.js, Tailwind CSS, dan MongoDB. Proyek ini menerapkan arsitektur modular, memanfaatkan fitur file-based routing serta integrasi API modern untuk menghadirkan pengalaman pengguna yang cepat dan intuitif.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Sistem ini dilengkapi dengan halaman admin, manajemen produk, autentikasi pengguna, serta form interaktif, menjadikannya fondasi yang solid untuk pengembangan lebih lanjut baik sebagai pembelajaran maupun proyek nyata.
        </p>
      </section>

      {/* Motivation */}
      <section className="bg-[#f1f1f1] py-12 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">“Terus melangkah dengan tekad, bangun solusi yang berdampak.”</h2>
        <p className="text-gray-700">
          Setiap proses pembelajaran adalah pondasi menuju masa depan yang lebih baik.
        </p>
      </section>

      <Footer />
    </>
  );
}