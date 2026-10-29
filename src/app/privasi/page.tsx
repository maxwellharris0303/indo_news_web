export const metadata = { title: "Kebijakan Privasi" };

export default function PrivasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 prose-article">
      <h1 className="font-serif text-3xl font-bold">Kebijakan Privasi</h1>
      <p>
        KabarDesk mengumpulkan data minimal yang diperlukan untuk layanan
        (misalnya preferensi tema di perangkat Anda). Geolokasi untuk berita
        daerah hanya diproses setelah izin eksplisit dan tidak disimpan tanpa
        persetujuan.
      </p>
      <p>
        Kami tidak menjual data pribadi pembaca. Analytics anonim digunakan untuk
        memahami performa konten.
      </p>
    </div>
  );
}
