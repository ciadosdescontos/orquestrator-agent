import { useState, useEffect } from 'react';
import { metricsApi } from '../api/metrics';

interface DashboardMetricsData {
  tokenData: any;
  costData: any;
  executionData: any;
  insights: any;
  isLoading: boolean;
}

/**
 * Hook to fetch and manage dashboard metrics data
 * Auto-refreshes every 30 seconds
 */
export const useDashboardMetrics = (projectId: string = 'current'): DashboardMetricsData => {
  const [data, setData] = useState<{
    tokenData: any;
    costData: any;
    executionData: any;
    insights: any;
  }>({
    tokenData: null,
    costData: null,
    executionData: null,
    insights: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Fetch all metrics in parallel using existing API
        const [tokens, costs, executions, insightsData] = await Promise.all([
          metricsApi.getTokenUsage(projectId, '7d', 'day'),
          metricsApi.getCostAnalysis(projectId, 'model'),
          metricsApi.getExecutionPerformance(projectId),
          metricsApi.getInsights(projectId),
        ]);

        setData({
          tokenData: tokens,
          costData: costs,
          executionData: executions,
          insights: insightsData?.insights || [],
        });
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
        // Set empty data on error to prevent UI from breaking
        setData({
          tokenData: null,
          costData: null,
          executionData: null,
          insights: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadMetrics();

    // Refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);

    return () => clearInterval(interval);
  }, [projectId]);

  return { ...data, isLoading };
};
