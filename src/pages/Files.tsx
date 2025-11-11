import { useState } from "react";
import { FileSidebar } from "@/components/FileManagement/FileSidebar";
import { FileHeader } from "@/components/FileManagement/FileHeader";
import { FileCard, FileItem } from "@/components/FileManagement/FileCard";
import { FileList } from "@/components/FileManagement/FileList";
import { FileUploadZone } from "@/components/FileManagement/FileUploadZone";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data
const mockFiles: FileItem[] = [
  { id: "1", name: "Project Proposal.docx", type: "document", size: "2.4 MB", modified: "2 hours ago", starred: true },
  { id: "2", name: "Design Mockups.fig", type: "image", size: "15.8 MB", modified: "1 day ago" },
  { id: "3", name: "Presentation.pptx", type: "document", size: "8.2 MB", modified: "3 days ago" },
  { id: "4", name: "Budget Report.xlsx", type: "document", size: "1.1 MB", modified: "1 week ago", starred: true },
  { id: "5", name: "Team Photo.jpg", type: "image", size: "4.5 MB", modified: "2 weeks ago" },
  { id: "6", name: "Product Demo.mp4", type: "video", size: "45.3 MB", modified: "3 weeks ago" },
  { id: "7", name: "Archive.zip", type: "archive", size: "120 MB", modified: "1 month ago" },
  { id: "8", name: "Meeting Recording.mp3", type: "audio", size: "12.7 MB", modified: "1 month ago" },
];

const Files = () => {
  const [selectedFolder, setSelectedFolder] = useState("home");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleFileSelect = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
    );
  };

  const handleDownload = (file: FileItem) => {
    toast.success(`Downloading ${file.name}...`);
  };

  const handleBulkDownload = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to download");
      return;
    }
    toast.success(`Downloading ${selectedFiles.length} file(s)...`);
  };

  const handleFilesUploaded = () => {
    setIsUploadOpen(false);
    toast.success("Files uploaded successfully");
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <FileSidebar selectedFolder={selectedFolder} onFolderSelect={setSelectedFolder} />
      
      <div className="flex-1 flex flex-col">
        <FileHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredFiles.length} files
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedFiles.length > 0 && (
                <Button onClick={handleBulkDownload} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download ({selectedFiles.length})
                </Button>
              )}
              
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                      Drag and drop files or click to browse
                    </DialogDescription>
                  </DialogHeader>
                  <FileUploadZone onFilesUploaded={handleFilesUploaded} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p className="text-lg">No files found</p>
              <p className="text-sm">Upload files to get started</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  isSelected={selectedFiles.includes(file.id)}
                  onSelect={handleFileSelect}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : (
            <FileList
              files={filteredFiles}
              selectedFiles={selectedFiles}
              onSelect={handleFileSelect}
              onDownload={handleDownload}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Files;
