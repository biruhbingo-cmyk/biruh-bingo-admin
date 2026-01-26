const normalizeBaseUrl = (url: string): string => {
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

const buildUrl = (baseUrl: string, ...paths: string[]): string => {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const normalizedPaths = paths.map(path => path.replace(/^\/+/, '').replace(/\/+$/, '')).filter(Boolean);
  return `${normalizedBase}/${normalizedPaths.join('/')}`;
};

export const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080');

export const API_ENDPOINTS = {
  auth: {
    login: buildUrl(API_BASE_URL, 'api', 'v1', 'auth', 'login'),
  },
  admin: {
    // User query endpoints
    getAllUsers: (limit = 50, offset = 0) => `${buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'users')}?limit=${limit}&offset=${offset}`,
    // Transaction query endpoints
    getAllTransactions: (limit = 50, offset = 0) => `${buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions')}?limit=${limit}&offset=${offset}`,
    getPendingDeposits: (limit = 50, offset = 0) => `${buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', 'pending', 'deposits')}?limit=${limit}&offset=${offset}`,
    getPendingWithdrawals: (limit = 50, offset = 0) => `${buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', 'pending', 'withdrawals')}?limit=${limit}&offset=${offset}`,
    getCompletedDeposits: (limit = 50, offset = 0) => `${buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', 'completed', 'deposits')}?limit=${limit}&offset=${offset}`,
    getCompletedWithdrawals: (limit = 50, offset = 0) => `${buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', 'completed', 'withdrawals')}?limit=${limit}&offset=${offset}`,
    getFailedTransactions: (limit = 50, offset = 0) => `${buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', 'failed')}?limit=${limit}&offset=${offset}`,
    getTransfers: (limit = 50, offset = 0) => `${buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', 'transfers')}?limit=${limit}&offset=${offset}`,
    // Transaction action endpoints
    approveDeposit: (id: string) => buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', id, 'approve-deposit'),
    rejectDeposit: (id: string) => buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', id, 'reject-deposit'),
    approveWithdrawal: (id: string) => buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', id, 'approve-withdrawal'),
    rejectWithdrawal: (id: string) => buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', id, 'reject-withdrawal'),
    cancelTransaction: (id: string) => buildUrl(API_BASE_URL, 'api', 'v1', 'admin', 'transactions', id, 'cancel'),
  },
  user: {
    register: buildUrl(API_BASE_URL, 'api', 'v1', 'user', 'register'),
    getByTelegramId: (telegramId: number) => buildUrl(API_BASE_URL, 'api', 'v1', 'user', 'telegram', String(telegramId)),
    getByPhone: (phone: string) => `${buildUrl(API_BASE_URL, 'api', 'v1', 'user', 'phone')}?phone=${encodeURIComponent(phone)}`,
    getByReferralCode: (code: string) => buildUrl(API_BASE_URL, 'api', 'v1', 'user', 'referral', code),
  },
  wallet: {
    deposit: buildUrl(API_BASE_URL, 'api', 'v1', 'wallet', 'deposit'),
    withdraw: buildUrl(API_BASE_URL, 'api', 'v1', 'wallet', 'withdraw'),
    transfer: buildUrl(API_BASE_URL, 'api', 'v1', 'wallet', 'transfer'),
    getByTelegramId: (telegramId: number) => buildUrl(API_BASE_URL, 'api', 'v1', 'wallet', 'telegram', String(telegramId)),
    getByUserId: (userId: string) => buildUrl(API_BASE_URL, 'api', 'v1', 'wallet', userId),
    getDeposits: (userId: string) => buildUrl(API_BASE_URL, 'api', 'v1', 'wallet', userId, 'deposits'),
    getWithdrawals: (userId: string) => buildUrl(API_BASE_URL, 'api', 'v1', 'wallet', userId, 'withdrawals'),
    getTransfers: (userId: string) => buildUrl(API_BASE_URL, 'api', 'v1', 'wallet', userId, 'transfers'),
  },
};

