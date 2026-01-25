export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/v1/auth/login`,
  },
  admin: {
    // User query endpoints
    getAllUsers: (limit = 50, offset = 0) => `${API_BASE_URL}/api/v1/admin/users?limit=${limit}&offset=${offset}`,
    // Transaction query endpoints
    getAllTransactions: (limit = 50, offset = 0) => `${API_BASE_URL}/api/v1/admin/transactions?limit=${limit}&offset=${offset}`,
    getPendingDeposits: (limit = 50, offset = 0) => `${API_BASE_URL}/api/v1/admin/transactions/pending/deposits?limit=${limit}&offset=${offset}`,
    getPendingWithdrawals: (limit = 50, offset = 0) => `${API_BASE_URL}/api/v1/admin/transactions/pending/withdrawals?limit=${limit}&offset=${offset}`,
    getCompletedDeposits: (limit = 50, offset = 0) => `${API_BASE_URL}/api/v1/admin/transactions/completed/deposits?limit=${limit}&offset=${offset}`,
    getCompletedWithdrawals: (limit = 50, offset = 0) => `${API_BASE_URL}/api/v1/admin/transactions/completed/withdrawals?limit=${limit}&offset=${offset}`,
    getFailedTransactions: (limit = 50, offset = 0) => `${API_BASE_URL}/api/v1/admin/transactions/failed?limit=${limit}&offset=${offset}`,
    getTransfers: (limit = 50, offset = 0) => `${API_BASE_URL}/api/v1/admin/transactions/transfers?limit=${limit}&offset=${offset}`,
    // Transaction action endpoints
    approveDeposit: (id: string) => `${API_BASE_URL}/api/v1/admin/transactions/${id}/approve-deposit`,
    rejectDeposit: (id: string) => `${API_BASE_URL}/api/v1/admin/transactions/${id}/reject-deposit`,
    approveWithdrawal: (id: string) => `${API_BASE_URL}/api/v1/admin/transactions/${id}/approve-withdrawal`,
    rejectWithdrawal: (id: string) => `${API_BASE_URL}/api/v1/admin/transactions/${id}/reject-withdrawal`,
    cancelTransaction: (id: string) => `${API_BASE_URL}/api/v1/admin/transactions/${id}/cancel`,
  },
  user: {
    register: `${API_BASE_URL}/api/v1/user/register`,
    getByTelegramId: (telegramId: number) => `${API_BASE_URL}/api/v1/user/telegram/${telegramId}`,
    getByPhone: (phone: string) => `${API_BASE_URL}/api/v1/user/phone?phone=${encodeURIComponent(phone)}`,
    getByReferralCode: (code: string) => `${API_BASE_URL}/api/v1/user/referral/${code}`,
  },
  wallet: {
    deposit: `${API_BASE_URL}/api/v1/wallet/deposit`,
    withdraw: `${API_BASE_URL}/api/v1/wallet/withdraw`,
    transfer: `${API_BASE_URL}/api/v1/wallet/transfer`,
    getByTelegramId: (telegramId: number) => `${API_BASE_URL}/api/v1/wallet/telegram/${telegramId}`,
    getByUserId: (userId: string) => `${API_BASE_URL}/api/v1/wallet/${userId}`,
    getDeposits: (userId: string) => `${API_BASE_URL}/api/v1/wallet/${userId}/deposits`,
    getWithdrawals: (userId: string) => `${API_BASE_URL}/api/v1/wallet/${userId}/withdrawals`,
    getTransfers: (userId: string) => `${API_BASE_URL}/api/v1/wallet/${userId}/transfers`,
  },
};

