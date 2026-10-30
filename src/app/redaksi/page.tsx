import Link from "next/link";
import { site } from "@/lib/site";

export const metadata = {
  title: "Redaksi",
  description:
    "Tim redaksi, standar jurnalistik, dan kontak KabarDesk — portal berita Indonesia.",
};

export default function RedaksiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 prose-article">
      <h1 className="font-serif text-3xl font-bold">Redaksi {site.name}</h1>
      <p className="lead text-muted-foreground">
        {site.tagline}. Kami melayani pembaca dengan berita terkini, verifikasi
        fakta, dan liputan daerah — dalam Bahasa Indonesia dan ringkasan
        Inggris bila relevan.
      </p>

      <h2 className="font-serif text-xl font-bold mt-8">Siapa kami</h2>
      <p>
        {site.name} adalah portal berita digital independen yang berkomitmen
        pada jurnalisme akurat, transparan, dan berpihak pada kepentingan
        publik. Redaksi bekerja terpisah dari bagian komersial; keputusan
        publikasi didasarkan pada relevansi, kebenaran, dan keamanan sumber.
      </p>

      <h2 className="font-serif text-xl font-bold mt-8">Standar editorial</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Asli redaksi</strong> — laporan, analisis, dan wawancara yang
          ditulis langsung oleh jurnalis {site.name}.
        </li>
        <li>
          <strong>Ulas ulang RSS</strong> — ringkasan dan penulisan ulang
          berdasarkan sumber RSS mitra media nasional, dengan atribusi dan
          tautan ke artikel asli; selalu melalui tinjauan editor sebelum
          terbit.
        </li>
        <li>
          Koreksi dan pembaruan dicantumkan di artikel bila ada kesalahan
          substantif.
        </li>
        <li>
          Kanal <Link href="/cek-fakta">Cek Fakta</Link> mengikuti standar
          verifikasi terpisah dari berita cepat.
        </li>
      </ul>

      <h2 className="font-serif text-xl font-bold mt-8">Kontak redaksi</h2>
      <p>
        <strong>Alamat redaksi:</strong> Jakarta, Indonesia
        <br />
        <strong>Email:</strong>{" "}
        <a href="mailto:redaksi@kabardesk.id">redaksi@kabardesk.id</a>
        <br />
        <strong>WhatsApp tip line:</strong> +62 812-0000-0000
        <br />
        <strong>Situs:</strong>{" "}
        <a href={site.url} rel="noopener noreferrer">
          {site.url.replace(/^https?:\/\//, "")}
        </a>
      </p>

      <h2 className="font-serif text-xl font-bold mt-8">Tip &amp; bantuan</h2>
      <p>
        Kirim informasi, dokumen, atau laporan dugaan disinformasi ke email
        redaksi. Jangan kirim materi yang melanggar privasi atau hak cipta
        tanpa izin. Untuk masalah teknis situs, sertakan tangkapan layar dan
        peramban yang Anda gunakan.
      </p>
    </div>
  );
}
