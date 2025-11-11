import { useState, useEffect } from "react";
import { Folder, Home, Star, Clock, Trash2, HardDrive, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { getAllFolders } from "@/lib/folderStorage";
import { Folder as FolderType } from "@/lib/fileStorage";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FileSidebarProps {
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
}

const defaultFolders = [
  { id: "all", label: "All Files", icon: Home },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "starred", label: "Starred", icon: Star },
];

export const FileSidebar = ({ selectedFolder, onFolderSelect }: FileSidebarProps) => {
  const [userFolders, setUserFolders] = useState<FolderType[]>([]);
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const folders = await getAllFolders();
      setUserFolders(folders);
    } catch (error) {
      console.error("Failed to load folders:", error);
    }
  };

  const handleFolderCreated = () => {
    loadFolders();
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          INTECU Files
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {defaultFolders.map((folder) => {
          const Icon = folder.icon;
          const isSelected = selectedFolder === folder.id;
          
          return (
            <button
              key={folder.id}
              onClick={() => onFolderSelect(folder.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isSelected
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{folder.label}</span>
            </button>
          );
        })}

        <div className="pt-4">
          <Collapsible open={isFoldersOpen} onOpenChange={setIsFoldersOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors">
              <span>My Folders</span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                isFoldersOpen && "transform rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-2">
              <CreateFolderDialog onFolderCreated={handleFolderCreated} />
              
              {userFolders.map((folder) => {
                const isSelected = selectedFolder === folder.id;
                
                return (
                  <button
                    key={folder.id}
                    onClick={() => onFolderSelect(folder.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
                      isSelected
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Folder className="w-4 h-4" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-sidebar-foreground">Storage</span>
            <span className="text-sidebar-accent-foreground font-medium">45%</span>
          </div>
          <div className="w-full bg-sidebar-border rounded-full h-2">
            <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "45%" }} />
          </div>
          <p className="text-xs text-muted-foreground">4.5 GB of 10 GB used</p>
        </div>
      </div>
    </aside>
  );
};
