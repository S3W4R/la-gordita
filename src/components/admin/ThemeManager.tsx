import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Palette, Type } from "lucide-react";

const FONTS = [
  { name: "Poppins", value: "Poppins" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Lato", value: "Lato" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Raleway", value: "Raleway" },
  { name: "Playfair Display", value: "Playfair Display" },
  { name: "Merriweather", value: "Merriweather" },
  { name: "Nunito", value: "Nunito" },
  { name: "Ubuntu", value: "Ubuntu" },
];

const COLORS = [
  { name: "Negro Oscuro", value: "#0d0d0d" },
  { name: "Gris Carbón", value: "#1a1a1a" },
  { name: "Azul Marino", value: "#0a1628" },
  { name: "Verde Bosque", value: "#0f1e13" },
  { name: "Marrón Chocolate", value: "#1c0f0a" },
  { name: "Púrpura Profundo", value: "#1a0a1e" },
  { name: "Rojo Vino", value: "#1e0a0a" },
  { name: "Gris Pizarra", value: "#1e2328" },
  { name: "Verde Oliva", value: "#1a1e0f" },
  { name: "Azul Medianoche", value: "#0f1a28" },
  { name: "Rosa Brillante", value: "#E91E63" },
  { name: "Verde Esmeralda", value: "#1B4D3E" },
  { name: "Naranja Cálido", value: "#D17B4F" },
  { name: "Lila Suave", value: "#B39DDB" },
  { name: "Menta Clara", value: "#7FCBC4" },
  { name: "Magenta Oscuro", value: "#8E1555" },
];

const ThemeManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [themeId, setThemeId] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState("Poppins");
  const [selectedColor, setSelectedColor] = useState("#0d0d0d");

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .single();

      if (error) throw error;

      if (data) {
        setThemeId(data.id);
        setSelectedFont(data.font_family);
        setSelectedColor(data.background_color);
      }
    } catch (error) {
      // Security: Don't log detailed errors in production
    }
  };

  const handleSaveTheme = async () => {
    if (!themeId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("theme_settings")
        .update({
          font_family: selectedFont,
          background_color: selectedColor,
        })
        .eq("id", themeId);

      if (error) throw error;

      toast({
        title: "Tema actualizado",
        description: "Los cambios se aplicarán en toda la aplicación.",
      });

      // Reload page to apply changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      // Security: Don't log detailed errors in production
      toast({
        title: "Error",
        description: "No se pudo actualizar el tema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Type className="w-5 h-5" />
            Tipografía
          </CardTitle>
          <CardDescription>Selecciona la fuente principal de la aplicación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label className="text-card-foreground">Fuente</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {FONTS.map((font) => (
                <Button
                  key={font.value}
                  variant={selectedFont === font.value ? "default" : "outline"}
                  className="h-auto py-3"
                  style={{ fontFamily: font.value }}
                  onClick={() => setSelectedFont(font.value)}
                >
                  {font.name}
                </Button>
              ))}
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
              <p className="text-lg" style={{ fontFamily: selectedFont }}>
                La Gordita - Auténtica comida mexicana
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Palette className="w-5 h-5" />
            Color de Fondo
          </CardTitle>
          <CardDescription>Selecciona el color de fondo principal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label className="text-card-foreground">Color</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {COLORS.map((color) => (
                <Button
                  key={color.value}
                  variant={selectedColor === color.value ? "default" : "outline"}
                  className="h-auto py-3 flex flex-col items-center gap-2"
                  onClick={() => setSelectedColor(color.value)}
                >
                  <div
                    className="w-12 h-12 rounded-md border-2 border-border"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs">{color.name}</span>
                </Button>
              ))}
            </div>
            <div
              className="mt-4 p-8 rounded-lg border-2 border-border"
              style={{ backgroundColor: selectedColor }}
            >
              <p className="text-foreground text-center">Vista previa del color de fondo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveTheme}
          disabled={loading}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
};

export default ThemeManager;
