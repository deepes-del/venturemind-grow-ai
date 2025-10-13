import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DatasetHistoryProps {
  userId: string;
}

interface Dataset {
  id: string;
  file_name: string;
  file_type: string;
  upload_date: string;
}

const DatasetHistory = ({ userId }: DatasetHistoryProps) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasets();
  }, [userId]);

  const fetchDatasets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("datasets")
      .select("*")
      .eq("user_id", userId)
      .order("upload_date", { ascending: false });

    if (error) {
      console.error("Error fetching datasets:", error);
      toast.error("Failed to load datasets");
    } else {
      setDatasets(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("datasets")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete dataset");
    } else {
      toast.success("Dataset deleted successfully");
      fetchDatasets();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Datasets Yet</h3>
        <p className="text-muted-foreground text-sm">
          Upload your first dataset to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {datasets.map((dataset, index) => (
        <div
          key={dataset.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-lg transition-all duration-300 animate-slide-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm truncate max-w-md">
                {dataset.file_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {dataset.file_type}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(dataset.upload_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(dataset.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default DatasetHistory;
