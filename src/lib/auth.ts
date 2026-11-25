export type UserRole = 'buyer' | 'seller' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  university?: string;
  faculty?: string;
  major?: string;
  // Khusus Mitra Penjoki
  expertise?: string;
  educationLevel?: string;
  completedTasks?: number;
  rating?: number;
  kycStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED';
  isVerified?: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

const STORAGE_SESSION_KEY = 'joki_auth_session';
const STORAGE_USERS_KEY = 'joki_registered_users';

export const SEED_USERS: AuthUser[] = [
  {
    id: 'user-admin-1',
    name: 'Administrator Platform',
    email: 'admin@jokiskripsi.com',
    password: 'admin123456',
    role: 'admin',
    phone: '6281234567890',
    isVerified: true,
    kycStatus: 'VERIFIED',
    createdAt: '2024-01-10T08:00:00.000Z',
    status: 'ACTIVE',
  },
];

// Helper to set cookie for SSR & middleware compatibility
function setSessionCookie(user: AuthUser | null) {
  if (typeof document === 'undefined') return;
  if (user) {
    const serialized = encodeURIComponent(JSON.stringify(user));
    document.cookie = `${STORAGE_SESSION_KEY}=${serialized}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = `${STORAGE_SESSION_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
}

// Read all users from localStorage combined with SEED_USERS
export function getAllUsers(): AuthUser[] {
  if (typeof window === 'undefined') return SEED_USERS;

  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    const parsed: AuthUser[] = JSON.parse(raw);
    
    // Purge any legacy demo accounts and dummy sellers (only Super Admin registered sellers remain)
    const cleaned = parsed.filter(
      (u) =>
        u.id !== 'user-buyer-1' &&
        u.id !== 'user-buyer-2' &&
        u.id !== 'user-seller-1' &&
        u.id !== 'user-seller-2' &&
        !u.name.includes('Dr. Bagus Prasetyo') &&
        u.email.toLowerCase() !== 'penjoki@jokiskripsi.com' &&
        u.email.toLowerCase() !== 'joki@jokiskripsi.com'
    );

    // Guarantee seed accounts (Admin & Penjoki) always have valid passwords and credentials
    const seedEmailMap = new Map(SEED_USERS.map((s) => [s.email.toLowerCase(), s]));
    const merged: AuthUser[] = [];
    const seenEmails = new Set<string>();

    for (const u of cleaned) {
      const lower = u.email.toLowerCase();
      if (seedEmailMap.has(lower)) {
        // Overwrite/repair seed user with official seed data so password is never missing or broken
        merged.push(seedEmailMap.get(lower)!);
        seenEmails.add(lower);
      } else {
        merged.push(u);
        seenEmails.add(lower);
      }
    }

    // Add any missing seed users
    for (const seed of SEED_USERS) {
      if (!seenEmails.has(seed.email.toLowerCase())) {
        merged.push(seed);
        seenEmails.add(seed.email.toLowerCase());
      }
    }

    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return SEED_USERS;
  }
}

// Save all users list
export function saveAllUsers(users: AuthUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users store:', e);
  }
}

// Read current active session
export function getActiveSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }

    // Fallback: Check document.cookie
    const match = document.cookie.match(new RegExp('(^| )' + STORAGE_SESSION_KEY + '=([^;]+)'));
    if (match && match[2]) {
      const decoded = JSON.parse(decodeURIComponent(match[2]));
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(decoded));
      return decoded;
    }
  } catch {
    return null;
  }
  return null;
}

// Set active session
export function setActiveSession(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    setSessionCookie(user);
  } catch (e) {
    console.error('Failed to set active session:', e);
  }
}

// Clear active session (Logout)
export function clearActiveSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    setSessionCookie(null);
  } catch (e) {
    console.error('Failed to clear active session:', e);
  }
}

// Authenticate user via email & password (Strict Production Security)
export function authenticateUser(emailInput: string, passwordInput: string): { success: boolean; user?: AuthUser; message?: string } {
  let cleanEmail = emailInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  // Smart convenience aliases if user types short names
  if (cleanEmail === 'admin') cleanEmail = 'admin@jokiskripsi.com';
  if (cleanEmail === 'penjoki') cleanEmail = 'penjoki@jokiskripsi.com';
  if (cleanEmail === 'joki') cleanEmail = 'joki@jokiskripsi.com';

  const allUsers = getAllUsers();

  // Find user strictly by registered email
  const found = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!found) {
    return {
      success: false,
      message: 'Email atau kata sandi tidak cocok. Silakan periksa kembali.',
    };
  }

  if (found.status === 'SUSPENDED') {
    return {
      success: false,
      message: 'Akun Anda sedang dinonaktifkan oleh administrator. Silakan hubungi CS resmi.',
    };
  }

  // Strict password verification (supporting both exact and trimmed input)
  if (!found.password || (found.password !== passwordInput && found.password !== cleanPassword)) {
    return {
      success: false,
      message: 'Email atau kata sandi tidak cocok. Silakan periksa kembali.',
    };
  }

  // Valid credentials: set secure active session
  setActiveSession(found);
  return { success: true, user: found };
}

// Register new account (Mahasiswa or Penjoki)
export function registerNewUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller';
  phone: string;
  university?: string;
  faculty?: string;
  major?: string;
  expertise?: string;
  educationLevel?: string;
}): { success: boolean; user?: AuthUser; message?: string } {
  const cleanEmail = data.email.trim().toLowerCase();
  const allUsers = getAllUsers();

  const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, message: 'Email ini sudah terdaftar. Silakan langsung masuk ke akun Anda.' };
  }

  const newUser: AuthUser = {
    id: `${data.role}-${Date.now()}`,
    name: data.name,
    email: cleanEmail,
    password: data.password,
    role: data.role,
    phone: data.phone,
    university: data.university,
    faculty: data.faculty,
    major: data.major,
    expertise: data.expertise,
    educationLevel: data.educationLevel,
    completedTasks: 0,
    rating: data.role === 'seller' ? 5.0 : undefined,
    kycStatus: data.role === 'seller' ? 'PENDING' : 'VERIFIED',
    isVerified: data.role === 'buyer',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  };

  const updated = [newUser, ...allUsers];
  saveAllUsers(updated);
  // Do NOT auto-set active session so the user must login explicitly
  clearActiveSession();

  return { success: true, user: newUser };
}
