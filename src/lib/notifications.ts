/**
 * Sistem Notifikasi In-App Jokiskripsiku
 * Digunakan untuk mencatat pemberitahuan sistem (pembayaran, serah terima tugas, penyelesaian proyek, dsb.)
 * dan menyinkronkannya dengan lonceng notifikasi pada navbar Header.
 */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'payment' | 'project' | 'kyc' | 'system';
  read: boolean;
}

export function addAppNotification(notif: {
  title: string;
  message: string;
  type?: 'payment' | 'project' | 'kyc' | 'system';
}): AppNotification | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem('joki_notifications');
    const existing: AppNotification[] = raw ? JSON.parse(raw) : [];

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'project',
      time: 'Baru saja',
      read: false,
    };

    const updated = [newNotif, ...existing.slice(0, 30)];
    localStorage.setItem('joki_notifications', JSON.stringify(updated));

    // Picu event kustom agar komponen Header otomatis memperbarui unread count
    window.dispatchEvent(new Event('joki_notifications_updated'));

    return newNotif;
  } catch (err) {
    console.warn('Gagal menyimpan notifikasi:', err);
    return null;
  }
}

export function getAppNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('joki_notifications');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markAllNotificationsAsRead(): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getAppNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    localStorage.setItem('joki_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('joki_notifications_updated'));
  } catch (err) {
    console.warn('Gagal memperbarui status notifikasi:', err);
  }
}
