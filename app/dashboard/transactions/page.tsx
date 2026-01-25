'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Search, RefreshCw, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_type?: string | null;
  transaction_id?: string | null;
  reference?: string | null;
  created_at: string;
}

interface Wallet {
  user_id: string;
  balance: number;
  demo_balance: number;
  updated_at: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  count: number;
  limit: number;
  offset: number;
}

export default function TransactionsPage() {
  const { token } = useAuth();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'completed' | 'failed'>('pending');
  const [typeTab, setTypeTab] = useState<'all' | 'deposit' | 'withdraw' | 'transfer'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    if (token) {
      loadTransactions();
    }
  }, [token, statusTab]);

  const getEndpointForStatus = () => {
    switch (statusTab) {
      case 'pending':
        // For pending, we'll fetch both pending deposits and withdrawals
        return null; // We'll handle this specially
      case 'completed':
        // For completed, we'll fetch both completed deposits and withdrawals
        return null; // We'll handle this specially
      case 'failed':
        return API_ENDPOINTS.admin.getFailedTransactions(100, 0);
      case 'all':
      default:
        return API_ENDPOINTS.admin.getAllTransactions(100, 0);
    }
  };

  const loadTransactions = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      let fetchedTransactions: Transaction[] = [];

      if (statusTab === 'pending') {
        // Fetch both pending deposits and withdrawals
        const [depositsRes, withdrawalsRes] = await Promise.all([
          fetch(API_ENDPOINTS.admin.getPendingDeposits(100, 0), {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(API_ENDPOINTS.admin.getPendingWithdrawals(100, 0), {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        let depositsData: TransactionsResponse = { transactions: [], count: 0, limit: 100, offset: 0 };
        let withdrawalsData: TransactionsResponse = { transactions: [], count: 0, limit: 100, offset: 0 };

        if (depositsRes.ok) {
          try {
            const json = await depositsRes.json();
            depositsData = {
              transactions: Array.isArray(json.transactions) ? json.transactions : [],
              count: json.count || 0,
              limit: json.limit || 100,
              offset: json.offset || 0,
            };
          } catch (e) {
            console.error('Failed to parse deposits response:', e);
          }
        }

        if (withdrawalsRes.ok) {
          try {
            const json = await withdrawalsRes.json();
            withdrawalsData = {
              transactions: Array.isArray(json.transactions) ? json.transactions : [],
              count: json.count || 0,
              limit: json.limit || 100,
              offset: json.offset || 0,
            };
          } catch (e) {
            console.error('Failed to parse withdrawals response:', e);
          }
        }

        fetchedTransactions = [
          ...(Array.isArray(depositsData.transactions) ? depositsData.transactions : []),
          ...(Array.isArray(withdrawalsData.transactions) ? withdrawalsData.transactions : []),
        ];
      } else if (statusTab === 'completed') {
        // Fetch both completed deposits and withdrawals
        const [depositsRes, withdrawalsRes] = await Promise.all([
          fetch(API_ENDPOINTS.admin.getCompletedDeposits(100, 0), {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(API_ENDPOINTS.admin.getCompletedWithdrawals(100, 0), {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        let depositsData: TransactionsResponse = { transactions: [], count: 0, limit: 100, offset: 0 };
        let withdrawalsData: TransactionsResponse = { transactions: [], count: 0, limit: 100, offset: 0 };

        if (depositsRes.ok) {
          try {
            const json = await depositsRes.json();
            depositsData = {
              transactions: Array.isArray(json.transactions) ? json.transactions : [],
              count: json.count || 0,
              limit: json.limit || 100,
              offset: json.offset || 0,
            };
          } catch (e) {
            console.error('Failed to parse deposits response:', e);
          }
        }

        if (withdrawalsRes.ok) {
          try {
            const json = await withdrawalsRes.json();
            withdrawalsData = {
              transactions: Array.isArray(json.transactions) ? json.transactions : [],
              count: json.count || 0,
              limit: json.limit || 100,
              offset: json.offset || 0,
            };
          } catch (e) {
            console.error('Failed to parse withdrawals response:', e);
          }
        }

        fetchedTransactions = [
          ...(Array.isArray(depositsData.transactions) ? depositsData.transactions : []),
          ...(Array.isArray(withdrawalsData.transactions) ? withdrawalsData.transactions : []),
        ];
      } else {
        const endpoint = getEndpointForStatus();
        if (!endpoint) {
          setAllTransactions([]);
          return;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const json = await response.json();
        fetchedTransactions = Array.isArray(json.transactions) ? json.transactions : [];
      }

      // Sort by created_at descending (most recent first)
      fetchedTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAllTransactions(fetchedTransactions);

      // Fetch wallet balances for pending withdrawals
      await loadUserBalances(fetchedTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setError('Failed to load transactions. Please try again.');
      setAllTransactions([]);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId: string, type: string) => {
    if (!token) return;

    try {
      const endpoint =
        type === 'deposit'
          ? API_ENDPOINTS.admin.approveDeposit(transactionId)
          : API_ENDPOINTS.admin.approveWithdrawal(transactionId);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear any previous errors
        setError(null);
        // Reload transactions after successful approval
        await loadTransactions();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to approve transaction:', errorData);
        setError(`Failed to approve transaction: ${errorData.error || 'Unknown error'}`);
        setTimeout(() => setError(null), 5000);
      }
    } catch (error) {
      console.error('Failed to approve transaction:', error);
      setError('Failed to approve transaction. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleReject = async (transactionId: string, type: string) => {
    if (!token) return;

    try {
      const endpoint =
        type === 'deposit'
          ? API_ENDPOINTS.admin.rejectDeposit(transactionId)
          : API_ENDPOINTS.admin.rejectWithdrawal(transactionId);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear any previous errors
        setError(null);
        // Reload transactions after successful rejection
        await loadTransactions();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to reject transaction:', errorData);
        setError(`Failed to reject transaction: ${errorData.error || 'Unknown error'}`);
        setTimeout(() => setError(null), 5000);
      }
    } catch (error) {
      console.error('Failed to reject transaction:', error);
      setError('Failed to reject transaction. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Filter transactions by status, type, and search term
  const getFilteredTransactions = () => {
    let filtered = allTransactions;

    // Filter by status
    if (statusTab !== 'all') {
      filtered = filtered.filter((tx) => tx.status === statusTab);
    }

    // Filter by type
    if (typeTab !== 'all') {
      if (typeTab === 'deposit') {
        filtered = filtered.filter((tx) => tx.type === 'deposit');
      } else if (typeTab === 'withdraw') {
        filtered = filtered.filter((tx) => tx.type === 'withdraw');
      } else if (typeTab === 'transfer') {
        filtered = filtered.filter((tx) => tx.type === 'transfer_in' || tx.type === 'transfer_out');
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((tx) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          tx.id.toLowerCase().includes(searchLower) ||
          tx.user_id.toLowerCase().includes(searchLower) ||
          tx.amount.toString().includes(searchTerm) ||
          (tx.transaction_id && tx.transaction_id.toLowerCase().includes(searchLower))
        );
      });
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'Deposit',
      withdraw: 'Withdrawal',
      transfer_in: 'Transfer In',
      transfer_out: 'Transfer Out',
    };
    return labels[type] || type;
  };

  const loadUserBalances = async (transactions: Transaction[]) => {
    if (!token) return;

    // Get unique user IDs from pending withdrawal transactions
    const pendingWithdrawalUserIds = [
      ...new Set(
        transactions
          .filter((tx) => tx.status === 'pending' && tx.type === 'withdraw')
          .map((tx) => tx.user_id)
      ),
    ];

    if (pendingWithdrawalUserIds.length === 0) {
      return;
    }

    try {
      // Fetch balances for all pending withdrawal users in parallel
      const balancePromises = pendingWithdrawalUserIds.map(async (userId) => {
        try {
          const response = await fetch(API_ENDPOINTS.wallet.getByUserId(userId), {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const json = await response.json();
            const walletData: Wallet = json.wallet || json;
            return { userId, balance: walletData.balance || 0 };
          }
          return { userId, balance: 0 };
        } catch (error) {
          console.error(`Failed to fetch balance for user ${userId}:`, error);
          return { userId, balance: 0 };
        }
      });

      const balanceResults = await Promise.all(balancePromises);
      const balancesMap: Record<string, number> = {};
      balanceResults.forEach(({ userId, balance }) => {
        balancesMap[userId] = balance;
      });

      setUserBalances((prev) => ({ ...prev, ...balancesMap }));
    } catch (error) {
      console.error('Failed to load user balances:', error);
    }
  };

  const handleCopyTransactionId = async (transactionId: string) => {
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopiedId(transactionId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
            <p className="text-muted-foreground">Manage and approve pending transactions</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadTransactions}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-6 bg-secondary/50 border-border/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, user, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border/50"
              />
            </div>
          </div>
        </Card>

        {/* Status Tabs */}
        <Tabs value={statusTab} onValueChange={(value) => setStatusTab(value as typeof statusTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {(['pending', 'completed', 'failed', 'all'] as const).map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              {/* Type Tabs within Status Tab */}
              <Tabs value={typeTab} onValueChange={(value) => setTypeTab(value as typeof typeTab)} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="all">All Types</TabsTrigger>
                  <TabsTrigger value="deposit">Deposits</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdrawals</TabsTrigger>
                  <TabsTrigger value="transfer">Transfers</TabsTrigger>
                </TabsList>

                {(['all', 'deposit', 'withdraw', 'transfer'] as const).map((type) => (
                  <TabsContent key={type} value={type}>
                {/* Transactions Table */}
                <Card className="bg-secondary/50 border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="p-8 text-center text-muted-foreground">
                        Loading transactions...
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-border/50 hover:bg-transparent">
                            <TableHead className="text-foreground">Transaction ID</TableHead>
                            <TableHead className="text-foreground">User ID</TableHead>
                            <TableHead className="text-foreground">Type</TableHead>
                            <TableHead className="text-foreground">Amount</TableHead>
                            <TableHead className="text-foreground">Status</TableHead>
                            <TableHead className="text-foreground">Date</TableHead>
                            <TableHead className="text-right text-foreground">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                {searchTerm ? 'No transactions match your search' : 'No transactions found'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredTransactions.map((tx) => (
                              <TableRow key={tx.id} className="border-b border-border/50 hover:bg-primary/5">
                                <TableCell className="text-foreground">
                                  {tx.transaction_id ? (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => setSelectedTransaction(tx)}
                                        className="font-mono text-sm text-primary hover:text-primary/80 hover:underline cursor-pointer"
                                        title="Click to view full transaction ID"
                                      >
                                        {tx.transaction_id}
                                      </button>
                                      <button
                                        onClick={() => handleCopyTransactionId(tx.transaction_id!)}
                                        className="p-1 hover:bg-secondary rounded"
                                        title="Copy transaction ID"
                                      >
                                        {copiedId === tx.transaction_id ? (
                                          <Check className="w-3 h-3 text-green-400" />
                                        ) : (
                                          <Copy className="w-3 h-3 text-muted-foreground" />
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="font-mono text-xs text-muted-foreground">N/A</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-foreground font-mono text-xs">{tx.user_id.slice(0, 8)}...</TableCell>
                                <TableCell className="text-foreground">{getTypeLabel(tx.type)}</TableCell>
                                <TableCell className="text-foreground">
                                  <div className="flex flex-col">
                                    <span className="font-semibold">${tx.amount.toFixed(2)}</span>
                                    {tx.status === 'pending' && tx.type === 'withdraw' && userBalances[tx.user_id] !== undefined && (
                                      <span className="text-xs text-muted-foreground mt-1">
                                        Balance: ${userBalances[tx.user_id].toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  {tx.status === 'pending' && (tx.type === 'deposit' || tx.type === 'withdraw') && (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                                        onClick={() => handleApprove(tx.id, tx.type)}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                        onClick={() => handleReject(tx.id, tx.type)}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                  {tx.status !== 'pending' && (
                                    <Badge variant="secondary" className="text-xs">
                                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                    </Badge>
                                  )}
                                  {tx.status === 'pending' && (tx.type === 'transfer_in' || tx.type === 'transfer_out') && (
                                    <Badge variant="secondary" className="text-xs">
                                      Auto-completed
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>

        {/* Transaction ID Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>Full transaction information</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-foreground font-mono text-sm break-all">
                        {selectedTransaction.transaction_id || 'N/A'}
                      </p>
                      {selectedTransaction.transaction_id && (
                        <button
                          onClick={() => handleCopyTransactionId(selectedTransaction.transaction_id!)}
                          className="p-1 hover:bg-secondary rounded"
                          title="Copy transaction ID"
                        >
                          {copiedId === selectedTransaction.transaction_id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Internal ID (UUID)</p>
                    <div className="flex items-center gap-2">
                      <p className="text-foreground font-mono text-xs break-all">{selectedTransaction.id}</p>
                      <button
                        onClick={() => handleCopyTransactionId(selectedTransaction.id)}
                        className="p-1 hover:bg-secondary rounded"
                        title="Copy UUID"
                      >
                        {copiedId === selectedTransaction.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">User ID</p>
                    <p className="text-foreground font-mono text-xs break-all">{selectedTransaction.user_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="text-foreground">{getTypeLabel(selectedTransaction.type)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="text-foreground font-semibold">${selectedTransaction.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <div>{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                  {selectedTransaction.transaction_type && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Transaction Type</p>
                      <p className="text-foreground">{selectedTransaction.transaction_type}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Created At</p>
                    <p className="text-foreground text-sm">
                      {new Date(selectedTransaction.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
