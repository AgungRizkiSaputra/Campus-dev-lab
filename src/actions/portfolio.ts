'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface PortfolioItem {
  id: string;
  joki_id: string;
  title: string;
  major: string;
  description: string;
  abstract_preview: string;
  sample_file_url?: string | null;
  created_at: string;
}

let mockPortfolios: PortfolioItem[] = [
  {
    id: 'port-1',
    joki_id: 'user-seller-1',
    title: 'Analisis Komparasi Kinerja Algoritma LSTM dan GRU pada Deteksi Anomali Jaringan',
    major: 'Teknik Informatika',
    description: 'Publikasi ilmiah dan kode implementasi Python PyTorch untuk evaluasi akurasi deteksi anomali paket jaringan.',
    abstract_preview: 'Penelitian ini membandingkan konvergensi loss dan akurasi model recurrent neural network pada dataset CICIDS2017...',
    sample_file_url: 'https://storage.jokiskripsi.com/samples/sample_lstm.pdf',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'port-2',
    joki_id: 'user-seller-1',
    title: 'Model Prediksi Nilai Tukar Rupiah dengan Metode ARIMA-GARCH',
    major: 'Statistika / Matematika',
    description: 'Pemodelan volatilitas runtun waktu finansial menggunakan software R dan EViews.',
    abstract_preview: 'Penerapan model heteroskedastisitas bersyarat untuk mengestimasi risiko fluktuasi kurs mata uang asing...',
    sample_file_url: 'https://storage.jokiskripsi.com/samples/sample_arima.pdf',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function getJokiPortfoliosAction(jokiId: string) {
  const list = mockPortfolios.filter((p) => p.joki_id === jokiId);
  return { success: true, portfolios: list };
}

export async function addPortfolioAction(
  title: string,
  major: string,
  description: string,
  abstractPreview: string,
  sampleFileUrl?: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const jokiId = user?.id || 'user-seller-1';

  const newItem: PortfolioItem = {
    id: `port-${Date.now()}`,
    joki_id: jokiId,
    title,
    major,
    description,
    abstract_preview: abstractPreview,
    sample_file_url: sampleFileUrl,
    created_at: new Date().toISOString(),
  };

  mockPortfolios.unshift(newItem);
  revalidatePath('/seller/portfolio');
  revalidatePath('/profile');
  return { success: true, portfolio: newItem };
}
