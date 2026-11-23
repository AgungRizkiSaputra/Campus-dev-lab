'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ShieldCheck, MessageSquare, RotateCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const phone = searchParams.get('phone') || '08123456789';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (val: string, index: number) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast({
        type: 'error',
        title: 'Kode Tidak Lengkap',
        message: 'Mohon masukkan 6 digit kode OTP.',
      });
      return;
    }

    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast({
        type: 'success',
        title: 'Verifikasi Berhasil',
        message: 'Nomor WhatsApp Anda telah terverifikasi aman.',
      });

      router.push('/buyer');
    } catch {
      toast({
        type: 'error',
        title: 'Verifikasi Gagal',
        message: 'Kode OTP salah atau telah kedaluwarsa.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    toast({
      type: 'info',
      title: 'Kode Baru Dikirim',
      message: `Kode verifikasi baru telah dikirimkan via WhatsApp ke ${phone}.`,
    });
  };

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 border border-forest-200 text-forest-800">
        <MessageSquare className="h-7 w-7 text-forest-800" />
      </div>

      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Verifikasi 2FA WhatsApp</h1>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Masukkan 6 digit kode keamanan yang dikirimkan ke nomor WhatsApp <strong className="text-gray-900">{phone}</strong>
        </p>
      </div>

      <Card className="border-forest-100 shadow-elevated">
        <CardContent className="pt-6">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="h-12 w-11 sm:h-14 sm:w-12 rounded-md border border-gray-300 text-center text-xl font-bold text-gray-900 focus:border-forest-700 focus:ring-2 focus:ring-forest-600 focus:outline-none transition-all"
                />
              ))}
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              className="w-full"
              isLoading={isVerifying}
            >
              Verifikasi & Masuk
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center text-xs text-gray-500 gap-1">
            {canResend ? (
              <button
                onClick={handleResend}
                className="font-semibold text-forest-800 hover:underline inline-flex items-center gap-1"
              >
                <RotateCw className="h-3.5 w-3.5" /> Kirim Ulang Kode
              </button>
            ) : (
              <span>Kirim ulang kode dalam <strong className="text-forest-900">{timer} detik</strong></span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="h-4 w-4 text-forest-700" />
        <span>Wablas Secure WhatsApp Two-Factor Authentication</span>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-muted">
      <Suspense fallback={<Skeleton className="h-96 w-full max-w-md" />}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
