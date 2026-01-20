import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Trash2, Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDocuments } from "@/lib/hooks";

export function AdminDocuments({ orderId }: { orderId: string }) {
  const { data: documents = [], isLoading } = useDocuments(orderId);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  const selectedDocument = documents.find((d: any) => d.id === selectedDocId);

  const docTypeColor = (type: string) => {
    switch (type) {
      case "resume":
        return "bg-blue-100 text-blue-700";
      case "coverLetter":
        return "bg-green-100 text-green-700";
      case "jobDescription":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">{(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={docTypeColor(doc.fileType)}>
                      {doc.fileType}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedDocId(doc.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Completed Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Drop completed resume here</p>
            <p className="text-xs text-muted-foreground">or click to upload PDF</p>
          </div>
        </CardContent>
      </Card>

      {/* Document Preview Modal */}
      <Dialog open={!!selectedDocId} onOpenChange={(open) => !open && setSelectedDocId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.fileName}</DialogTitle>
            <DialogDescription>
              Uploaded on {selectedDocument ? new Date(selectedDocument.createdAt).toLocaleString() : ""} • {selectedDocument ? (selectedDocument.fileSize / 1024).toFixed(1) : 0} KB
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="bg-secondary p-8 rounded-lg text-center text-muted-foreground min-h-[300px] flex items-center justify-center">
                <div>
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">PDF Preview</p>
                  <p className="text-xs text-muted-foreground mt-1">(In production, shows actual PDF)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" asChild>
                  <a href={selectedDocument.fileUrl} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </a>
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
