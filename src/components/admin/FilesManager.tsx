import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Download, 
  Trash2, 
  Link as LinkIcon, 
  Folder, 
  FolderOpen,
  File,
  ArrowLeft,
  FolderPlus
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FileObject } from "@supabase/storage-js";


const FilesManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentFolder, setCurrentFolder] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileObject | null>(null);
  const [fileToMove, setFileToMove] = useState<FileObject | null>(null);
  const [targetFolder, setTargetFolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  // Fetch files and folders
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["files", currentFolder],
    queryFn: async () => {
      const path = currentFolder || undefined;
      const { data, error } = await supabase.storage
        .from("files")
        .list(path, {
          limit: 100,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) throw error;
      return data;
    },
  });

  // Get unique folders from all files
  const { data: allFolders = [] } = useQuery({
    queryKey: ["all-folders"],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("files")
        .list("", { limit: 1000 });

      if (error) throw error;
      
      const folders = new Set<string>();
      const getAllFolders = async (path = "") => {
        const { data: items } = await supabase.storage
          .from("files")
          .list(path, { limit: 1000 });
        
        items?.forEach((item) => {
          if (item.id === null) {
            const folderPath = path ? `${path}/${item.name}` : item.name;
            folders.add(folderPath);
          }
        });
      };

      await getAllFolders();
      return Array.from(folders);
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const filePath = currentFolder 
        ? `${currentFolder}/${file.name}` 
        : file.name;

      const { error } = await supabase.storage
        .from("files")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["all-folders"] });
      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente.",
      });
      setUploadFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo subir el archivo.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (file: FileObject) => {
      const filePath = currentFolder 
        ? `${currentFolder}/${file.name}` 
        : file.name;

      const { error } = await supabase.storage
        .from("files")
        .remove([filePath]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["all-folders"] });
      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado correctamente.",
      });
      setFileToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo.",
        variant: "destructive",
      });
    },
  });

  // Move mutation
  const moveMutation = useMutation({
    mutationFn: async ({ file, destination }: { file: FileObject; destination: string }) => {
      const sourcePath = currentFolder 
        ? `${currentFolder}/${file.name}` 
        : file.name;
      const destPath = destination 
        ? `${destination}/${file.name}` 
        : file.name;

      const { error } = await supabase.storage
        .from("files")
        .move(sourcePath, destPath);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["all-folders"] });
      toast({
        title: "Archivo movido",
        description: "El archivo se ha movido correctamente.",
      });
      setFileToMove(null);
      setTargetFolder("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo mover el archivo.",
        variant: "destructive",
      });
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      const folderPath = currentFolder 
        ? `${currentFolder}/${folderName}/.keep` 
        : `${folderName}/.keep`;

      const { error } = await supabase.storage
        .from("files")
        .upload(folderPath, new Blob([""]), { upsert: false });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["all-folders"] });
      toast({
        title: "Carpeta creada",
        description: "La carpeta se ha creado correctamente.",
      });
      setNewFolderName("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la carpeta.",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (uploadFile) {
      uploadMutation.mutate(uploadFile);
    }
  };

  const handleDownload = async (file: FileObject) => {
    const filePath = currentFolder 
      ? `${currentFolder}/${file.name}` 
      : file.name;

    const { data, error } = await supabase.storage
      .from("files")
      .download(filePath);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo.",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async (file: FileObject) => {
    const filePath = currentFolder 
      ? `${currentFolder}/${file.name}` 
      : file.name;

    const { data } = supabase.storage
      .from("files")
      .getPublicUrl(filePath);

    await navigator.clipboard.writeText(data.publicUrl);
    toast({
      title: "Link copiado",
      description: "El enlace se ha copiado al portapapeles.",
    });
  };

  const handleMove = () => {
    if (fileToMove) {
      moveMutation.mutate({ file: fileToMove, destination: targetFolder });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const folders = files.filter((f) => f.id === null);
  const regularFiles = files.filter((f) => f.id !== null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestor de Archivos</h2>
      </div>

      {/* Current Path & Upload */}
      <Card className="bg-card border-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {currentFolder && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const parts = currentFolder.split("/");
                parts.pop();
                setCurrentFolder(parts.join("/"));
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>
          )}
          <span className="text-sm">
            / {currentFolder || "raíz"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload File */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Subir archivo</label>
            <div className="flex gap-2">
              <Input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="bg-background border-border"
              />
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || uploadMutation.isPending}
                className="whitespace-nowrap"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir
              </Button>
            </div>
          </div>

          {/* Create Folder */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nueva carpeta</label>
            <div className="flex gap-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nombre de carpeta"
                className="bg-background border-border"
              />
              <Button
                onClick={() => createFolderMutation.mutate(newFolderName)}
                disabled={!newFolderName || createFolderMutation.isPending}
                className="whitespace-nowrap"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Crear
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Files List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando archivos...</p>
        ) : (
          <>
            {/* Folders */}
            {folders.map((folder) => (
              <Card
                key={folder.name}
                className="bg-card border-border p-4 hover:border-accent transition-colors cursor-pointer"
                onClick={() => setCurrentFolder(currentFolder ? `${currentFolder}/${folder.name}` : folder.name)}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-8 h-8 text-primary" />
                  <span className="font-medium text-foreground">{folder.name}</span>
                </div>
              </Card>
            ))}

            {/* Files */}
            {regularFiles.map((file) => (
              <Card
                key={file.id}
                className="bg-card border-border p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="w-8 h-8 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.metadata?.size || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      className="border-border hover:bg-primary/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(file)}
                      className="border-border hover:bg-accent/10"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFileToMove(file)}
                      className="border-border hover:bg-primary/10"
                    >
                      <Folder className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFileToDelete(file)}
                      className="border-border hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {folders.length === 0 && regularFiles.length === 0 && (
              <Card className="bg-card border-border p-12 text-center">
                <File className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay archivos en esta carpeta</p>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. El archivo "{fileToDelete?.name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && deleteMutation.mutate(fileToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move File Dialog */}
      <AlertDialog open={!!fileToMove} onOpenChange={() => setFileToMove(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Mover archivo</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Selecciona la carpeta de destino para "{fileToMove?.name}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={targetFolder} onValueChange={setTargetFolder}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Seleccionar carpeta" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="">/ (raíz)</SelectItem>
                {allFolders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    / {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMove} className="bg-primary hover:bg-primary/90">
              Mover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FilesManager;
