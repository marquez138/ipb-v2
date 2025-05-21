import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#d9cfc7] py-16 text-center rounded-lg mb-10">
        <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
        <p className="text-gray-700 mt-4">Ada pertanyaan atau saran? Kami siap mendengar kamu.</p>
      </section>

      {/* Contact Form */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama</label>
            <input type="text" placeholder="Nama kamu" className="w-full px-4 py-2 border rounded-lg mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" placeholder="you@example.com" className="w-full px-4 py-2 border rounded-lg mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pesan</label>
            <textarea rows="5" placeholder="Tulis pesan kamu di sini..." className="w-full px-4 py-2 border rounded-lg mt-1"></textarea>
          </div>
          <button type="submit" className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition">Kirim Pesan</button>
        </form>
      </section>

      {/* Contact Info */}
      <section className="bg-[#f0f0f0] py-12 text-center text-gray-700">
        <p className="mb-2">📍 Jl. Startup No. 88, Palembang, Indonesia</p>
        <p className="mb-2">📞 +62 857 7171 8586</p>
        <p>✉️ elbastian0310@gmail.com</p>
      </section>

      <Footer />
    </>
  );
}