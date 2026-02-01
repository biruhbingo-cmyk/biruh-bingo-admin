'use client';

import React from "react"

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch, formatCurrency } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Users, RefreshCw, DollarSign, Gamepad2, Activity, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  pending_deposits: number;
  pending_withdrawals: number;
  total_users: number;
  total_transactions: number;
  total_balance: number;
  games_by_type: Record<string, number>;
  total_house_cut: number;
}

interface DashboardStatsResponse {
  pending_deposits: number;
  pending_withdrawals: number;
  total_users: number;
  total_transactions: number;
  total_balance: number;
  games_by_type: Record<string, number>;
  total_house_cut: number;
}

export default function DashboardPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    pending_deposits: 0,
    pending_withdrawals: 0,
    total_users: 0,
    total_transactions: 0,
    total_balance: 0,
    games_by_type: {},
    total_house_cut: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'down'>('down');

  useEffect(() => {
    if (token) {
      loadStats();
    }
  }, [token]);

  const checkSystemHealth = async (token: string): Promise<'healthy' | 'degraded' | 'down'> => {
    try {
      const startTime = Date.now();
      const response = await apiFetch(API_ENDPOINTS.admin.getDashboardStats(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }, () => {
        logout();
        router.push('/login');
      });
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        if (responseTime < 1000) {
          return 'healthy';
        } else if (responseTime < 3000) {
          return 'degraded';
        } else {
          return 'degraded';
        }
      } else {
        return 'degraded';
      }
    } catch {
      return 'down';
    }
  };

  const loadStats = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const startTime = Date.now();
      const response = await apiFetch(API_ENDPOINTS.admin.getDashboardStats(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }, () => {
        logout();
        router.push('/login');
      });
      const responseTime = Date.now() - startTime;

      // Update system health based on response time
      if (response.ok) {
        if (responseTime < 1000) {
          setSystemHealth('healthy');
        } else if (responseTime < 3000) {
          setSystemHealth('degraded');
        } else {
          setSystemHealth('degraded');
        }
      } else {
        setSystemHealth('degraded');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }

      const data: DashboardStatsResponse = await response.json();

      setStats({
        pending_deposits: data.pending_deposits || 0,
        pending_withdrawals: data.pending_withdrawals || 0,
        total_users: data.total_users || 0,
        total_transactions: data.total_transactions || 0,
        total_balance: data.total_balance || 0,
        games_by_type: data.games_by_type || {},
        total_house_cut: data.total_house_cut || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to load dashboard data. Please try again.');
      setSystemHealth('down');
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
    value: string | number | React.ReactNode;
    change?: string;
    changeType?: 'up' | 'down';
  }) => (
    <Card className="p-6 bg-secondary/50 border-border/50 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <div className="text-3xl font-bold text-foreground">{value}</div>
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


  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'Healthy';
      case 'degraded':
        return 'Degraded';
      case 'down':
        return 'Down';
      default:
        return 'Unknown';
    }
  };

  const totalGames = Object.values(stats.games_by_type).reduce((sum, count) => sum + count, 0);

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

        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<ArrowDownLeft className="w-6 h-6 text-primary" />}
            label="Pending Deposits"
            value={loading ? '...' : stats.pending_deposits}
          />
          <StatCard
            icon={<ArrowUpRight className="w-6 h-6 text-primary" />}
            label="Pending Withdrawals"
            value={loading ? '...' : stats.pending_withdrawals}
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-primary" />}
            label="Total Users"
            value={loading ? '...' : stats.total_users}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            label="Total Transactions"
            value={loading ? '...' : stats.total_transactions}
          />
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-primary" />}
            label="Total Money in System"
            value={loading ? '...' : formatCurrency(stats.total_balance)}
          />
          <StatCard
            icon={<Coins className="w-6 h-6 text-primary" />}
            label="Total House Cut"
            value={loading ? '...' : formatCurrency(stats.total_house_cut)}
          />
  
          <StatCard
            icon={<Gamepad2 className="w-6 h-6 text-primary" />}
            label="Total Games Played"
            value={loading ? '...' : totalGames}
          />
        </div>

        {/* Games by Type */}
        <Card className="p-6 bg-secondary/50 border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Games Played by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'].map((gameType) => {
              const count = stats.games_by_type?.[gameType] ?? 0;
              const displayCount = Math.max(0, count);
              return (
                <div key={gameType} className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">{gameType}</p>
                  <p className="text-xl font-bold text-foreground">
                    {loading ? '...' : displayCount}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
