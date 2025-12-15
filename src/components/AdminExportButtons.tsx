import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ExportType = 'guitars' | 'models' | 'serial_patterns';

const exportConfigs: Record<ExportType, { label: string; filename: string }> = {
  guitars: { label: 'Export Guitars', filename: 'approved-guitars' },
  models: { label: 'Export Models', filename: 'models' },
  serial_patterns: { label: 'Export Patterns', filename: 'serial-patterns' },
};

interface AdminExportButtonsProps {
  types?: ExportType[];
}

export const AdminExportButtons = ({ types = ['guitars', 'models', 'serial_patterns'] }: AdminExportButtonsProps) => {
  const [loading, setLoading] = useState<ExportType | null>(null);

  const downloadCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
          // Escape quotes and wrap in quotes if contains comma
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type: ExportType) => {
    setLoading(type);
    try {
      let data: Record<string, unknown>[] = [];

      switch (type) {
        case 'guitars': {
          const { data: guitars, error } = await supabase
            .from('guitars')
            .select('*')
            .eq('status', 'approved');
          if (error) throw error;
          data = guitars || [];
          break;
        }
        case 'models': {
          const { data: models, error } = await supabase
            .from('models')
            .select('*');
          if (error) throw error;
          data = models || [];
          break;
        }
        case 'serial_patterns': {
          const { data: patterns, error } = await supabase
            .from('serial_patterns')
            .select('*');
          if (error) throw error;
          data = patterns || [];
          break;
        }
      }

      downloadCSV(data, exportConfigs[type].filename);
      toast.success(`Exported ${data.length} records`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {types.map(type => (
        <Button
          key={type}
          variant="outline"
          size="sm"
          onClick={() => handleExport(type)}
          disabled={loading !== null}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {loading === type ? 'Exporting...' : exportConfigs[type].label}
        </Button>
      ))}
    </div>
  );
};
