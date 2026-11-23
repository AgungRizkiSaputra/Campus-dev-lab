'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { getJokiReviewsAction, submitReviewAction, type ReviewItem } from '@/actions/reviews';
import { getJokiPortfoliosAction, type PortfolioItem } from '@/actions/portfolio';
import {
  GraduationCap,
  ShieldCheck,
  Star,
  BookOpen,
  CheckCircle2,
  FileText,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export default function ProfilePage() {
  const { toast } = useToast();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [ratingSummary, setRatingSummary] = useState({ avg: 4.95, count: 32 });

  // Add Review Dialog
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [revRes, portRes] = await Promise.all([
        getJokiReviewsAction('user-seller-1'),
        getJokiPortfoliosAction('user-seller-1'),
      ]);

      if (revRes.success && revRes.reviews) {
        setReviews(revRes.reviews);
        setRatingSummary({ avg: revRes.average, count: revRes.count });
      }
      if (portRes.success && portRes.portfolios) {
        setPortfolios(portRes.portfolios);
      }
    }
    load();
  }, []);

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await submitReviewAction(
        'demo-1',
        'Pengembangan Model Deteksi Anomali Jaringan Berbasis Deep Learning',
        'user-seller-1',
        rating,
        reviewText
      );

      if (!res.success) {
        toast({ type: 'error', title: 'Gagal', message: res.error });
        return;
      }

      toast({
        type: 'success',
        title: 'Ulasan Berhasil Dikirim!',
        message: 'Terima kasih atas ulasan dan penilaian bintang Anda.',
      });

      setIsReviewOpen(false);
      setReviewText('');
      if (res.review) {
        setReviews((prev) => [res.review!, ...prev]);
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', message: 'Kesalahan sistem' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      {/* Profile Header Banner */}
      <Card className="p-8 border-forest-100 shadow-card bg-gradient-to-r from-white via-surface-muted to-forest-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-forest-800 text-2xl font-serif font-bold text-white shadow-md ring-4 ring-forest-100">
              HW
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-gray-900">
                  Dr. Hendra Wijaya, M.Kom
                </h1>
                <Badge variant="forest">Verified KYC</Badge>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                Alumni Universitas Gadjah Mada &bull; Spesialisasi: AI, Machine Learning, & Data Science
              </p>
              <div className="flex items-center gap-4 text-xs pt-1">
                <span className="flex items-center gap-1 font-bold text-amber-800">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  {ratingSummary.avg} ({ratingSummary.count} ulasan)
                </span>
                <span className="text-gray-400">&bull;</span>
                <span className="text-forest-800 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-forest-700" /> 28 Skripsi Selesai
                </span>
              </div>
            </div>
          </div>

          <div>
            <Button variant="primary" size="sm" onClick={() => setIsReviewOpen(true)}>
              <Star className="h-4 w-4 mr-1.5" /> Beri Penilaian & Review
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid: Portfolios & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Portfolios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-gray-900">Portofolio & Sampel Riset</h2>
            <Badge variant="forest">{portfolios.length} Karya</Badge>
          </div>

          <div className="space-y-3">
            {portfolios.map((port) => (
              <Card key={port.id} className="p-5 space-y-2">
                <Badge variant="gray">{port.major}</Badge>
                <h3 className="font-serif font-bold text-base text-gray-900">{port.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{port.description}</p>
                {port.sample_file_url && (
                  <a
                    href={port.sample_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-forest-800 hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    <FileText className="h-3.5 w-3.5" /> Buka Sampel Paper <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-gray-900">Ulasan Mahasiswa Terverifikasi</h2>
            <Badge variant="gold">Bintang 5.0 Rata-rata</Badge>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <Card key={rev.id} className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">{rev.buyer_name}</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-gray-400">Proyek: {rev.project_title}</p>
                <p className="text-xs text-gray-700 leading-relaxed bg-surface-muted p-3 rounded-md border border-gray-100">
                  &ldquo;{rev.review_text}&rdquo;
                </p>
                <span className="text-[10px] text-gray-400 block pt-1">{formatDate(rev.created_at)}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Berikan Ulasan & Rating Bimbingan"
        description="Ulasan Anda membantu menjaga standar kualitas dan kredibilitas di ekosistem Joki Skripsi."
      >
        <form onSubmit={handleSendReview} className="space-y-4 pt-2 text-xs text-left">
          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-gray-700">Bintang Penilaian (1 - 5)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className={`p-1.5 rounded hover:bg-amber-50 transition-colors ${
                    s <= rating ? 'text-amber-500' : 'text-gray-300'
                  }`}
                >
                  <Star className={`h-6 w-6 ${s <= rating ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
              <span className="font-bold text-sm text-gray-800 ml-2">{rating} dari 5 Bintang</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-gray-700">Ulasan & Testimonial</label>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Bagikan pengalaman bimbingan skripsi Anda bersama konsultan ini..."
              className="w-full rounded-md border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
              required
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsReviewOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Publikasikan Ulasan
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
