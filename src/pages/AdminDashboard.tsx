import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Calendar, Newspaper, Image, Palette, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/la-gordita-logo.png";
import EventsManager from "@/components/admin/EventsManager";
import PublicationsManager from "@/components/admin/PublicationsManager";
import GalleryManager from "@/components/admin/GalleryManager";
import ThemeManager from "@/components/admin/ThemeManager";
import FilesManager from "@/components/admin/FilesManager";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin");
        return;
      }

      // Check if user has admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const hasAdminRole = roles?.some(r => r.role === "admin");
      
      if (!hasAdminRole) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de administrador.",
          variant: "destructive",
        });
        navigate("/menu");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      // Security: Don't log detailed errors in production
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
    navigate("/menu");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verificando permisos...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="La Gordita" className="w-16 h-16" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Panel de Administración
              </h1>
              <p className="text-muted-foreground">
                Gestiona el contenido de La Gordita
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="publications" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Newspaper className="w-4 h-4 mr-2" />
              Publicaciones
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image className="w-4 h-4 mr-2" />
              Galería
            </TabsTrigger>
            <TabsTrigger value="theme" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Palette className="w-4 h-4 mr-2" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FolderOpen className="w-4 h-4 mr-2" />
              Archivos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <EventsManager />
          </TabsContent>

          <TabsContent value="publications">
            <PublicationsManager />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeManager />
          </TabsContent>

          <TabsContent value="files">
            <FilesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;