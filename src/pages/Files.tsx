import { useState, useEffect } from "react";
import { FileSidebar } from "@/components/FileManagement/FileSidebar";
import { FileHeader } from "@/components/FileManagement/FileHeader";
import { FileCard, FileItem } from "@/components/FileManagement/FileCard";
import { FileList } from "@/components/FileManagement/FileList";
import { FileUploadZone } from "@/components/FileManagement/FileUploadZone";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAllFiles, downloadFile } from "@/lib/fileStorage";
import { getAllFolders } from "@/lib/folderStorage";

const Files = () => {
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [folderName, setFolderName] = useState("All Files");

  useEffect(() => {
    loadFiles();
    loadFolderName();
  }, [selectedFolder]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const storedFiles = await getAllFiles(selectedFolder);
      setFiles(storedFiles);
    } catch (error) {
      console.error("Failed to load files:", error);
      toast.error("Failed to load files");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolderName = async () => {
    const defaultNames: Record<string, string> = {
      all: "All Files",
      recent: "Recent",
      starred: "Starred",
    };

    if (defaultNames[selectedFolder]) {
      setFolderName(defaultNames[selectedFolder]);
    } else {
      try {
        const folders = await getAllFolders();
        const folder = folders.find(f => f.id === selectedFolder);
        setFolderName(folder?.name || "Unknown Folder");
      } catch (error) {
        console.error("Failed to load folder name:", error);
        setFolderName("Folder");
      }
    }
  };

  const handleFileSelect = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
    );
  };

  const handleDownload = async (file: FileItem) => {
    try {
      await downloadFile(file.id);
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleBulkDownload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to download");
      return;
    }
    
    try {
      for (const fileId of selectedFiles) {
        await downloadFile(fileId);
      }
      toast.success(`Downloaded ${selectedFiles.length} file(s)`);
    } catch (error) {
      console.error("Bulk download error:", error);
      toast.error("Failed to download some files");
    }
  };

  const handleFilesUploaded = async () => {
    setIsUploadOpen(false);
    await loadFiles();
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
              <h2 className="text-2xl font-bold">{folderName}</h2>
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
                    <FileUploadZone 
                      onFilesUploaded={handleFilesUploaded}
                      currentFolderId={selectedFolder}
                    />
                  </DialogContent>
              </Dialog>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p className="text-lg">Loading files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
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
