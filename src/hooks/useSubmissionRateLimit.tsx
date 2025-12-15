import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const MAX_PENDING_SUBMISSIONS = 5;

export const useSubmissionRateLimit = () => {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pending-submissions-count', user?.email],
    queryFn: async () => {
      if (!user?.email) return { count: 0, canSubmit: true };

      const { count, error } = await supabase
        .from('guitars')
        .select('*', { count: 'exact', head: true })
        .eq('submitted_by_email', user.email)
        .eq('status', 'pending');

      if (error) throw error;

      const pendingCount = count || 0;
      return {
        count: pendingCount,
        canSubmit: pendingCount < MAX_PENDING_SUBMISSIONS,
        remaining: MAX_PENDING_SUBMISSIONS - pendingCount
      };
    },
    enabled: !!user?.email,
  });

  return {
    pendingCount: data?.count ?? 0,
    canSubmit: data?.canSubmit ?? true,
    remainingSubmissions: data?.remaining ?? MAX_PENDING_SUBMISSIONS,
    maxSubmissions: MAX_PENDING_SUBMISSIONS,
    isLoading,
    refetch
  };
};
