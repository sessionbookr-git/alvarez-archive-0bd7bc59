import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Json } from "@/integrations/supabase/types";

type EventType = 
  | 'serial_lookup'
  | 'serial_lookup_failed'
  | 'model_view'
  | 'submission_started'
  | 'submission_completed'
  | 'page_view';

export const useAnalytics = () => {
  const { user } = useAuth();

  const track = async (eventType: EventType, eventData: Record<string, string | number | boolean | null> = {}) => {
    try {
      await supabase.from('analytics_events').insert([{
        event_type: eventType,
        event_data: eventData as Json,
        user_email: user?.email || null
      }]);
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.error('Analytics error:', error);
    }
  };

  return { track };
};
