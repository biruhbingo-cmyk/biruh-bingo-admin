'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Search, Plus, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  referal_code: string;
  created_at: string;
  updated_at: string;
}

interface UserWallet {
  user_id: string;
  balance: number;
  demo_balance: number;
  updated_at: string;
}

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<(User & { wallet?: UserWallet })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<(User & { wallet?: UserWallet }) | null>(null);

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Note: There is no admin endpoint to list all users
      // Users can only be accessed via lookup endpoints (telegram_id, phone, referral_code)
      setUsers([]);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.telegram_id.toString().includes(searchLower) ||
      user.referal_code.toLowerCase().includes(searchLower)
    );
  });

  const totalBalance = users.reduce((sum, user) => sum + (user.wallet?.balance || 0), 0);
  const avgBalance = users.length > 0 ? totalBalance / users.length : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">View and manage user accounts and wallets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-secondary/50 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{users.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <span className="text-primary font-bold">👥</span>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-secondary/50 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                <p className="text-3xl font-bold text-foreground">${totalBalance.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                {/* Wallet icon */}
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-secondary/50 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Balance</p>
                <p className="text-3xl font-bold text-foreground">${avgBalance.toFixed(2)}</p>
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
                placeholder="Search by name, telegram ID, or referral code..."
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
                  <TableHead className="text-foreground">Joined</TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
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
                        ${user.wallet?.balance.toFixed(2) || '0.00'}
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
                          <DialogContent>
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
                                    <p className="text-xs text-muted-foreground">Telegram ID</p>
                                    <p className="text-foreground font-medium">{selectedUser.telegram_id}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p className="text-foreground font-medium">{selectedUser.phone_number}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Referral Code</p>
                                    <p className="text-foreground font-medium">{selectedUser.referal_code}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Wallet Balance</p>
                                    <p className="text-foreground font-bold">
                                      ${selectedUser.wallet?.balance.toFixed(2) || '0.00'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Joined</p>
                                    <p className="text-foreground font-medium">
                                      {new Date(selectedUser.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Last Updated</p>
                                    <p className="text-foreground font-medium">
                                      {new Date(selectedUser.updated_at).toLocaleDateString()}
                                    </p>
                                  </div>
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
        </Card>
      </div>
    </DashboardLayout>
  );
}
