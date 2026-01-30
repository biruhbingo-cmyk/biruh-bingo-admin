'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Plus, TrendingUp, Wallet, Users as UsersIcon, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  referal_code: string;
  role: string;
  created_at: string;
  updated_at: string;
  wallet?: {
    user_id: string;
    balance: number;
    demo_balance: number;
    updated_at: string;
  };
}

interface UsersResponse {
  users: User[];
  count: number;
  limit: number;
  offset: number;
}

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token, offset]);

  const loadUsers = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.admin.getAllUsers(limit, offset), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users || []);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.first_name?.toLowerCase() || '').includes(searchLower) ||
      (user.last_name?.toLowerCase() || '').includes(searchLower) ||
      user.telegram_id?.toString().includes(searchLower) ||
      (user.referal_code?.toLowerCase() || '').includes(searchLower) ||
      (user.phone_number || '').includes(searchTerm)
    );
  });

  const totalBalance = users.reduce((sum, user) => sum + (user.wallet?.balance || 0), 0);
  const avgBalance = users.length > 0 ? totalBalance / users.length : 0;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const handlePreviousPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (offset + limit < totalCount) {
      setOffset(offset + limit);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
            <p className="text-muted-foreground">View and manage user accounts and wallets</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-secondary/50 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? '...' : totalCount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <UsersIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-secondary/50 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? '...' : formatCurrency(totalBalance)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-secondary/50 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Balance</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? '...' : formatCurrency(avgBalance)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="p-6 bg-secondary/50 border-border/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, telegram ID, phone, or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border/50"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="bg-secondary/50 border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Telegram ID</TableHead>
                  <TableHead className="text-foreground">Phone</TableHead>
                  <TableHead className="text-foreground">Referral Code</TableHead>
                  <TableHead className="text-foreground">Wallet Balance</TableHead>
                  <TableHead className="text-foreground">Role</TableHead>
                  <TableHead className="text-foreground">Joined</TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No users found matching your search' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-b border-border/50 hover:bg-primary/5">
                      <TableCell className="text-foreground font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell className="text-foreground font-mono">{user.telegram_id}</TableCell>
                      <TableCell className="text-foreground">{user.phone_number}</TableCell>
                      <TableCell className="text-foreground font-mono">{user.referal_code}</TableCell>
                      <TableCell className="text-foreground font-bold">
                        {formatCurrency(user.wallet?.balance || 0)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                              <DialogDescription>
                                {selectedUser?.first_name} {selectedUser?.last_name}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">User ID</p>
                                    <p className="text-foreground font-mono text-sm">{selectedUser.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Telegram ID</p>
                                    <p className="text-foreground font-medium">{selectedUser.telegram_id}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                    <p className="text-foreground font-medium">{selectedUser.phone_number}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Referral Code</p>
                                    <p className="text-foreground font-mono">{selectedUser.referal_code}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Role</p>
                                    <p className="text-foreground font-medium">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        selectedUser.role === 'admin' 
                                          ? 'bg-purple-500/20 text-purple-400' 
                                          : 'bg-blue-500/20 text-blue-400'
                                      }`}>
                                        {selectedUser.role}
                                      </span>
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Wallet Balance</p>
                                    <p className="text-foreground font-bold text-lg">
                                      {formatCurrency(selectedUser.wallet?.balance || 0)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Demo Balance</p>
                                    <p className="text-foreground font-medium">
                                      {formatCurrency(selectedUser.wallet?.demo_balance || 0)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Joined</p>
                                    <p className="text-foreground font-medium">
                                      {new Date(selectedUser.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                                    <p className="text-foreground font-medium">
                                      {new Date(selectedUser.updated_at).toLocaleString()}
                                    </p>
                                  </div>
                                  {selectedUser.wallet && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Wallet Last Updated</p>
                                      <p className="text-foreground font-medium">
                                        {new Date(selectedUser.wallet.updated_at).toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && totalCount > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount.toLocaleString()} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={offset === 0 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={offset + limit >= totalCount || loading}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
