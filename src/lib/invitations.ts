export type EventInfo = {
  title: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  address: string;
};

export type InvitationData = {
  slug: string;
  coupleNames: string;
  firstNameA: string;
  firstNameB: string;
  greeting: string;
  eventDate: string;
  quote: string;
  akad: EventInfo;
  reception: EventInfo;
};

// Data demo sengaja dipisahkan dari komponen. Nanti data tiap customer bisa berasal dari database.
export const invitations: Record<string, InvitationData> = {
  "raka-alya": {
    slug: "raka-alya",
    coupleNames: "Raka & Alya",
    firstNameA: "Raka",
    firstNameB: "Alya",
    greeting: "Kepada keluarga dan sahabat terkasih",
    eventDate: "Minggu, 22 November 2026",
    quote: "Dua cerita, satu tujuan, dan perjalanan baru yang dimulai bersama.",
    akad: {
      title: "Akad Nikah",
      dateLabel: "Minggu, 22 November 2026",
      timeLabel: "08.00 WIB – selesai",
      venue: "Ruang Acara Contoh",
      address: "Alamat demo, Bandung, Jawa Barat",
    },
    reception: {
      title: "Resepsi",
      dateLabel: "Minggu, 22 November 2026",
      timeLabel: "11.00 – 14.00 WIB",
      venue: "Taman Senja (Demo)",
      address: "Alamat demo, Bandung, Jawa Barat",
    },
  },
  "andika-nadira": {
    slug: "andika-nadira",
    coupleNames: "Andika & Nadira",
    firstNameA: "Andika",
    firstNameB: "Nadira",
    greeting: "Dengan penuh rasa syukur, kami mengundang Anda",
    eventDate: "Sabtu, 12 Desember 2026",
    quote: "Semoga langkah kecil hari ini menjadi awal dari banyak cerita baik.",
    akad: {
      title: "Akad Nikah",
      dateLabel: "Sabtu, 12 Desember 2026",
      timeLabel: "09.00 WIB – selesai",
      venue: "Pendopo Keluarga (Demo)",
      address: "Alamat demo, Cimahi, Jawa Barat",
    },
    reception: {
      title: "Resepsi",
      dateLabel: "Sabtu, 12 Desember 2026",
      timeLabel: "12.00 – 15.00 WIB",
      venue: "Balai Kencana (Demo)",
      address: "Alamat demo, Cimahi, Jawa Barat",
    },
  },
};
