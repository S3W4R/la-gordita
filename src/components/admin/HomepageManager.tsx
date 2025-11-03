import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

const HomepageManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newLogoUrl: string) => {
      if (!settings?.id) throw new Error("No settings found");
      
      const { error } = await supabase
        .from("site_settings")
        .update({ homepage_logo_url: newLogoUrl })
        .eq("id", settings.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({
        title: "Éxito",
        description: "Imagen de portada actualizada correctamente",
      });
      setLogoUrl("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split(".").pop();
      const fileName = `homepage-logo-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("files")
        .getPublicUrl(filePath);

      await updateMutation.mutateAsync(publicUrl);

      toast({
        title: "Éxito",
        description: "Imagen subida y actualizada correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al subir: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoUrl.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate(logoUrl);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Imagen de Portada</CardTitle>
          <CardDescription>
            Gestiona la imagen del logo que aparece en la página de bienvenida
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Logo Preview */}
          {settings?.homepage_logo_url && (
            <div className="space-y-2">
              <Label>Imagen Actual</Label>
              <div className="flex items-center justify-center p-4 border rounded-lg bg-muted">
                <img
                  src={settings.homepage_logo_url}
                  alt="Logo actual"
                  className="max-h-48 object-contain"
                />
              </div>
            </div>
          )}

          {/* Upload File */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Subir Nueva Imagen</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading || updateMutation.isPending}
                className="flex-1"
              />
              {uploading && <Loader2 className="animate-spin h-5 w-5" />}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O</span>
            </div>
          </div>

          {/* URL Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-url">URL de la Imagen</Label>
              <Input
                id="logo-url"
                type="text"
                placeholder="https://ejemplo.com/imagen.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </div>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending || !logoUrl.trim()}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar URL'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Users Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Crear Usuarios Administradores</CardTitle>
          <CardDescription>
            Ejecutar esta acción creará los usuarios administradores predefinidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={async () => {
              try {
                const { data, error } = await supabase.functions.invoke('create-admin-users');
                
                if (error) throw error;

                const successCount = data.results.filter((r: any) => r.success).length;
                const failCount = data.results.filter((r: any) => !r.success).length;

                toast({
                  title: "Proceso completado",
                  description: `${successCount} administradores creados exitosamente. ${failCount} fallos.`,
                });

                console.log('Resultados detallados:', data.results);
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: `Error al crear administradores: ${error.message}`,
                  variant: "destructive",
                });
              }
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Crear Administradores
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomepageManager;