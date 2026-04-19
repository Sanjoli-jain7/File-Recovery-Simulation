import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { 
  getGetFilesystemQueryKey, 
  getGetDiskBlocksQueryKey,
  getGetDashboardStatsQueryKey,
  getGetActivityLogQueryKey,
  getGetPerformanceHistoryQueryKey,
  getGetRecoveryLogsQueryKey
} from "@workspace/api-client-react";

export function useInvalidateAll() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getGetFilesystemQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDiskBlocksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetActivityLogQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetPerformanceHistoryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecoveryLogsQueryKey() });
  }, [queryClient]);
}
