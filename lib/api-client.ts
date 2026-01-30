'use client';

/**
 * Custom fetch wrapper that handles 401 responses by redirecting to login
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
  onUnauthorized?: () => void
): Promise<Response> {
  const response = await fetch(url, options);

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Clear any stored auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
    
    // Call custom handler or redirect
    if (onUnauthorized) {
      onUnauthorized();
    } else {
      // Default: redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    throw new Error('Unauthorized - Please login again');
  }

  return response;
}

/**
 * Format currency as ETB (Ethiopian Birr)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

