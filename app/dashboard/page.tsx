'use client';

import React from "react"

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DashboardStats {
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalUsers: number;
  totalTransactions: number;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalUsers: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadStats();
    }
  }, [token]);

  const loadStats = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Fetch all data in parallel
      const [usersRes, pendingDepositsRes, pendingWithdrawalsRes, allTransactionsRes] = await Promise.all([
        fetch(API_ENDPOINTS.admin.getAllUsers(1, 0), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(API_ENDPOINTS.admin.getPendingDeposits(1, 0), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(API_ENDPOINTS.admin.getPendingWithdrawals(1, 0), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(API_ENDPOINTS.admin.getAllTransactions(1, 0), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      // Parse responses
      let totalUsers = 0;
      let pendingDeposits = 0;
      let pendingWithdrawals = 0;
      let totalTransactions = 0;

      if (usersRes.ok) {
        try {
          const usersData = await usersRes.json();
          totalUsers = usersData.count || 0;
        } catch (e) {
          console.error('Failed to parse users response:', e);
        }
      }

      if (pendingDepositsRes.ok) {
        try {
          const depositsData = await pendingDepositsRes.json();
          pendingDeposits = depositsData.count || 0;
        } catch (e) {
          console.error('Failed to parse pending deposits response:', e);
        }
      }

      if (pendingWithdrawalsRes.ok) {
        try {
          const withdrawalsData = await pendingWithdrawalsRes.json();
          pendingWithdrawals = withdrawalsData.count || 0;
        } catch (e) {
          console.error('Failed to parse pending withdrawals response:', e);
        }
      }

      if (allTransactionsRes.ok) {
        try {
          const transactionsData = await allTransactionsRes.json();
          totalTransactions = transactionsData.count || 0;
        } catch (e) {
          console.error('Failed to parse transactions response:', e);
        }
      }

      setStats({
        pendingDeposits,
        pendingWithdrawals,
        totalUsers,
        totalTransactions,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    changeType,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'up' | 'down';
  }) => (
    <Card className="p-6 bg-secondary/50 border-border/50 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={`text-xs mt-2 ${changeType === 'up' ? 'text-green-400' : 'text-orange-400'}`}>
              {changeType === 'up' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">{Icon}</div>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor pending transactions and system metrics</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<ArrowDownLeft className="w-6 h-6 text-primary" />}
            label="Pending Deposits"
            value={loading ? '...' : stats.pendingDeposits}
          />
          <StatCard
            icon={<ArrowUpRight className="w-6 h-6 text-primary" />}
            label="Pending Withdrawals"
            value={loading ? '...' : stats.pendingWithdrawals}
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-primary" />}
            label="Total Users"
            value={loading ? '...' : stats.totalUsers}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            label="Total Transactions"
            value={loading ? '...' : stats.totalTransactions}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-secondary/50 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Action Needed</h3>
              <Badge variant="destructive" className="bg-destructive/20 text-destructive">
                {stats.pendingDeposits + stats.pendingWithdrawals}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              There are pending transactions requiring your attention
            </p>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => window.location.href = '/dashboard/transactions'}
            >
              Review Transactions
            </Button>
          </Card>

          <Card className="p-6 bg-secondary/50 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">System Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">All systems operational</p>
            <Button variant="outline" className="w-full bg-transparent">
              View Details
            </Button>
          </Card>

          <Card className="p-6 bg-secondary/50 border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                  View User List
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                  Transaction History
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                  System Settings
                </Button>
              </li>
            </ul>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 bg-secondary/50 border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recent activity data available</p>
              <p className="text-xs mt-2">Activity tracking requires additional API endpoints</p>
              </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
