import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";

interface UploadDatasetProps {
  userId: string;
}

const UploadDataset = ({ userId }: UploadDatasetProps) => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [problem, setProblem] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !problem.trim()) {
      toast.error("Please upload a file and describe your business problem");
      return;
    }

    setAnalyzing(true);

    try {
      // Read file content
      const fileContent = await file.text();

      // Store dataset reference
      const { data: datasetData, error: datasetError } = await supabase
        .from("datasets")
        .insert({
          user_id: userId,
          file_name: file.name,
          file_path: "uploaded",
          file_type: file.type,
        })
        .select()
        .single();

      if (datasetError) throw datasetError;

      // Call AI analysis function
      const { data, error } = await supabase.functions.invoke("analyze-business", {
        body: {
          datasetContent: fileContent,
          problemStatement: problem,
          datasetId: datasetData.id,
        },
      });

      if (error) throw error;

      toast.success("Analysis complete! Check the Insights tab.");
      setFile(null);
      setProblem("");
      
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze data");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-xl border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Your Business Data
        </CardTitle>
        <CardDescription>
          Upload your business dataset (CSV, Excel, or JSON) and describe the problem you want to solve
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Dataset File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="problem">Business Problem / Goal</Label>
          <Textarea
            id="problem"
            placeholder="E.g., We want to increase engagement on social media and attract more local customers..."
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!file || !problem.trim() || analyzing}
          variant="hero"
          className="w-full"
        >
          {analyzing ? "Analyzing with AI..." : "Analyze with AI"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UploadDataset;
