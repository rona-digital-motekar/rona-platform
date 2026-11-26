export type EventInfo = {
  title: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  address: string;
  mapsUrl?: string;
};

export type StoryItem = {
  year: string;
  title: string;
  story: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  note: string;
  imageUrl?: string;
};

export type GiftAccount = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export type InvitationData = {
  slug: string;
  coupleNames: string;
  firstNameA: string;
  firstNameB: string;
  parentNamesA?: string;
  parentNamesB?: string;
  greeting: string;
  eventDate: string;
  quote: string;
  akad: EventInfo;
  reception: EventInfo;
  templateSlug: string;
  templateId?: string;
  storyTimeline?: StoryItem[];
  gallery?: GalleryItem[];
  giftAccounts?: GiftAccount[];
  isTemplateDemo?: boolean;
  updatedAt?: string;
};

export type RsvpEntry = {
  id: string;
  invitationSlug: string;
  guestName: string;
  status: "hadir" | "berhalangan";
  guestCount: number;
  message: string;
  approved: boolean;
  createdAt: string;
};

export const INITIAL_INVITATIONS: Record<string, InvitationData> = {
  "bagas-clarissa": {
    slug: "bagas-clarissa",
    templateSlug: "rona-atelier-royal-3d",
    templateId: "tpl_atelier_01",
    coupleNames: "Bagas & Clarissa",
    firstNameA: "Bagas",
    firstNameB: "Clarissa",
    parentNamesA: "Putra dari Bpk. Hendra Kusuma & Ibu Ratna Sari",
    parentNamesB: "Putri dari Bpk. Darmawan & Ibu Meutia Rahma",
    greeting: "Dengan penuh rasa syukur dan kehormatan, kami mengundang kehadiran Anda",
    eventDate: "Sabtu, 26 Desember 2026",
    quote:
      "Cinta yang tenang bukanlah gemuruh sesaat, melainkan janji untuk saling menjaga dalam setiap musim kehidupan.",
    akad: {
      title: "Akad Nikah",
      dateLabel: "Sabtu, 26 Desember 2026",
      timeLabel: "08.00 – 10.00 WIB",
      venue: "Pendopo Agung Dharmawangsa",
      address: "Jl. Dharmawangsa Raya No. 24, Kebayoran Baru, Jakarta Selatan",
      mapsUrl: "https://maps.google.com/?q=Kebayoran+Baru+Jakarta",
    },
    reception: {
      title: "Resepsi Malam",
      dateLabel: "Sabtu, 26 Desember 2026",
      timeLabel: "18.30 – 21.30 WIB",
      venue: "Glasshouse Atelier Paviliun",
      address: "Jl. Kemang Timur No. 12, Jakarta Selatan",
      mapsUrl: "https://maps.google.com/?q=Kemang+Jakarta+Selatan",
    },
    storyTimeline: [
      {
        year: "2020",
        title: "Pertemuan di Pameran Arsitektur",
        story: "Berawal dari diskusi singkat mengenai pencahayaan ruang dan sketsa tangan, kami menemukan cara pandang yang saling melengkapi.",
      },
      {
        year: "2023",
        title: "Merancang Masa Depan",
        story: "Menjalani fase jarak jauh dengan penuh kesabaran hingga akhirnya kembali berlabuh di kota yang sama.",
      },
      {
        year: "2026",
        title: "Ikatan Suci",
        story: "Menyatukan dua keluarga besar dalam doa tulus dan langkah awal rumah tangga.",
      },
    ],
    gallery: [
      { id: "g-bc-1", title: "Senja di Bandung", note: "Potret sore setelah pertunangan" },
      { id: "g-bc-2", title: "Cahaya Pagi", note: "Langkah tenang menuju hari bahagia" },
      { id: "g-bc-3", title: "Sketsa Dua Jiwa", note: "Kenangan perjalanan musim gugur" },
      { id: "g-bc-4", title: "Janji Abadi", note: "Menyambut babak baru bersama" },
    ],
    giftAccounts: [
      { bankName: "Bank Mandiri", accountNumber: "1300084920112", accountHolder: "Bagas Kusuma" },
      { bankName: "Bank BCA", accountNumber: "7770492184", accountHolder: "Clarissa Darmawan" },
    ],
    isTemplateDemo: true,
    updatedAt: "2026-11-24",
  },
  "dimas-sarah": {
    slug: "dimas-sarah",
    templateSlug: "rona-storybook-cinematic",
    templateId: "tpl_storybook_01",
    coupleNames: "Dimas & Sarah",
    firstNameA: "Dimas",
    firstNameB: "Sarah",
    parentNamesA: "Putra dari Bpk. Surya Pratama & Ibu Lestari",
    parentNamesB: "Putri dari Bpk. Arifin Hakim & Ibu Ningsih",
    greeting: "Babak baru dimulai: sebuah kisah tentang dua hati yang saling memilih",
    eventDate: "Sabtu, 19 Desember 2026",
    quote:
      "Di antara jutaan kisah di dunia, kami bersyukur semesta menuliskan jalan kami untuk bertemu, belajar, dan melangkah bersama selamanya.",
    akad: {
      title: "Akad Nikah",
      dateLabel: "Sabtu, 19 Desember 2026",
      timeLabel: "08.30 – 10.30 WIB",
      venue: "Paviliun Kaca Lembah Asri",
      address: "Jl. Ranca Bentang No. 18, Bandung, Jawa Barat",
      mapsUrl: "https://maps.google.com/?q=Bandung+Jawa+Barat",
    },
    reception: {
      title: "Resepsi & Jamuan Kasih",
      dateLabel: "Sabtu, 19 Desember 2026",
      timeLabel: "11.30 – 15.00 WIB",
      venue: "Taman Cerita Asri",
      address: "Jl. Ranca Bentang No. 18, Bandung, Jawa Barat",
      mapsUrl: "https://maps.google.com/?q=Bandung+Jawa+Barat",
    },
    storyTimeline: [
      {
        year: "2021",
        title: "Halaman Pertama: Percakapan di Sudut Senja",
        story: "Di sebuah kedai kopi di sudut kota saat hujan reda, obrolan singkat tentang buku dan mimpi masa depan perlahan menumbuhkan ketertarikan yang tak terduga.",
      },
      {
        year: "2023",
        title: "Babak Kedua: Belajar Bertumbuh Bersama",
        story: "Menjelajahi banyak tempat, melewati suka dan duka bersama, serta menyadari bahwa rumah sejati bukan sekadar tempat, melainkan bersama siapa kita pulang.",
      },
      {
        year: "2026",
        title: "Janji Selamanya: Menulis Bab Masa Depan",
        story: "Dengan restu kedua orang tua dan doa tulus sahabat tercinta, kami memutuskan untuk mengikat janji suci dan mengarungi samudera kehidupan bersama.",
      },
    ],
    gallery: [
      { id: "g1", title: "Momen Awal", note: "Senyum pertama di Selabintana" },
      { id: "g2", title: "Langkah Bersama", note: "Menemukan ritme perjalanan kita" },
      { id: "g3", title: "Janji Suci", note: "Menatap hari esok dengan penuh harap" },
      { id: "g4", title: "Penuh Tawa", note: "Kepingan bahagia sederhana" },
    ],
    giftAccounts: [
      { bankName: "Bank BCA", accountNumber: "2840193821", accountHolder: "Dimas Pratama" },
    ],
    isTemplateDemo: true,
    updatedAt: "2026-11-24",
  },
  "raka-alya": {
    slug: "raka-alya",
    templateSlug: "rona-ivory-editorial",
    templateId: "tpl_ivory_01",
    coupleNames: "Raka & Alya",
    firstNameA: "Raka",
    firstNameB: "Alya",
    parentNamesA: "Putra dari Bpk. Wijaya & Ibu Kartini",
    parentNamesB: "Putri dari Bpk. Rahman & Ibu Amelia",
    greeting: "Kepada keluarga dan sahabat terkasih",
    eventDate: "Minggu, 22 November 2026",
    quote: "Dua cerita, satu tujuan, dan perjalanan baru yang dimulai bersama.",
    akad: {
      title: "Akad Nikah",
      dateLabel: "Minggu, 22 November 2026",
      timeLabel: "08.00 WIB – selesai",
      venue: "Gedung Heritage Pendopo",
      address: "Jl. Braga No. 45, Bandung, Jawa Barat",
      mapsUrl: "https://maps.google.com/?q=Jalan+Braga+Bandung",
    },
    reception: {
      title: "Resepsi",
      dateLabel: "Minggu, 22 November 2026",
      timeLabel: "11.00 – 14.00 WIB",
      venue: "Taman Senja Courtyard",
      address: "Jl. Dago Pakar No. 8, Bandung, Jawa Barat",
      mapsUrl: "https://maps.google.com/?q=Dago+Pakar+Bandung",
    },
    storyTimeline: [
      {
        year: "2022",
        title: "Awal Perkenalan",
        story: "Dipertemukan oleh rekan studio di Bandung dalam proyek desain pameran.",
      },
      {
        year: "2026",
        title: "Hari Bahagia",
        story: "Mengikat janji setia di hadapan keluarga tercinta.",
      },
    ],
    gallery: [
      { id: "g-ra-1", title: "Potret Klasik", note: "Nuansa hangat pagi Bandung" },
      { id: "g-ra-2", title: "Dua Langkah", note: "Menyambut awal bersama" },
    ],
    isTemplateDemo: true,
    updatedAt: "2026-11-24",
  },
  "andika-nadira": {
    slug: "andika-nadira",
    templateSlug: "rona-earth-terracotta",
    templateId: "tpl_terracotta_02",
    coupleNames: "Andika & Nadira",
    firstNameA: "Andika",
    firstNameB: "Nadira",
    parentNamesA: "Putra dari Bpk. Bambang & Ibu Sri Wahyuni",
    parentNamesB: "Putri dari Bpk. Taufik & Ibu Marissa",
    greeting: "Dengan penuh rasa syukur, kami mengundang Anda",
    eventDate: "Sabtu, 12 Desember 2026",
    quote: "Semoga langkah kecil hari ini menjadi awal dari banyak cerita baik.",
    akad: {
      title: "Akad Nikah",
      dateLabel: "Sabtu, 12 Desember 2026",
      timeLabel: "09.00 WIB – selesai",
      venue: "Pendopo Keluarga",
      address: "Jl. Kolonel Masturi No. 11, Cimahi, Jawa Barat",
      mapsUrl: "https://maps.google.com/?q=Cimahi+Jawa+Barat",
    },
    reception: {
      title: "Resepsi",
      dateLabel: "Sabtu, 12 Desember 2026",
      timeLabel: "12.00 – 15.00 WIB",
      venue: "Balai Kencana",
      address: "Jl. Kolonel Masturi No. 11, Cimahi, Jawa Barat",
      mapsUrl: "https://maps.google.com/?q=Cimahi+Jawa+Barat",
    },
    isTemplateDemo: true,
    updatedAt: "2026-11-24",
  },
  "demo-rona-sage-botanical": {
    slug: "demo-rona-sage-botanical",
    templateSlug: "rona-sage-botanical",
    templateId: "tpl_sage_03",
    coupleNames: "Naufal & Kirana",
    firstNameA: "Naufal",
    firstNameB: "Kirana",
    parentNamesA: "Putra dari Bpk. Aditya & Ibu Dewi",
    parentNamesB: "Putri dari Bpk. Santoso & Ibu Farah",
    greeting: "Dalam rimbun doa dan kasih keluarga, kami mengundang Anda",
    eventDate: "Minggu, 10 Januari 2027",
    quote: "Seperti dedaunan yang bertumbuh tenang menuju cahaya, begitulah kami melangkah bersama.",
    akad: {
      title: "Akad Nikah",
      dateLabel: "Minggu, 10 Januari 2027",
      timeLabel: "08.30 – 10.00 WIB",
      venue: "Rumah Kaca Botanical",
      address: "Jl. Taman Kebun Raya No. 5, Bogor, Jawa Barat",
    },
    reception: {
      title: "Garden Luncheon",
      dateLabel: "Minggu, 10 Januari 2027",
      timeLabel: "11.00 – 14.30 WIB",
      venue: "Lawn Eucalyptus",
      address: "Jl. Taman Kebun Raya No. 5, Bogor, Jawa Barat",
    },
    isTemplateDemo: true,
    updatedAt: "2026-11-24",
  },
};

export const INITIAL_RSVPS: RsvpEntry[] = [
  {
    id: "rsvp_seed_1",
    invitationSlug: "bagas-clarissa",
    guestName: "Rendra & Pasangan",
    status: "hadir",
    guestCount: 2,
    message: "Selamat menempuh hidup baru Bagas & Clarissa! Semoga sakinah mawaddah warahmah selalu.",
    approved: true,
    createdAt: "2026-11-22T09:15:00.000Z",
  },
  {
    id: "rsvp_seed_2",
    invitationSlug: "dimas-sarah",
    guestName: "Nadia Putri",
    status: "hadir",
    guestCount: 1,
    message: "Undangan buku ceritanya hangat sekali dibaca! Sampai jumpa di Bandung.",
    approved: true,
    createdAt: "2026-11-23T14:20:00.000Z",
  },
  {
    id: "rsvp_seed_3",
    invitationSlug: "raka-alya",
    guestName: "Bima Sakti",
    status: "berhalangan",
    guestCount: 1,
    message: "Mohon maaf berhalangan hadir karena tugas luar kota, doa terbaik untuk Raka & Alya.",
    approved: true,
    createdAt: "2026-11-23T16:45:00.000Z",
  },
];
