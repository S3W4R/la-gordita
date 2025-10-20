import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTheme = () => {
  const [theme, setTheme] = useState({
    fontFamily: "Poppins",
    backgroundColor: "#0d0d0d",
  });

  useEffect(() => {
    loadTheme();

    // Subscribe to theme changes
    const channel = supabase
      .channel("theme_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "theme_settings",
        },
        () => {
          loadTheme();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTheme = async () => {
    try {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .single();

      if (error) throw error;

      if (data) {
        setTheme({
          fontFamily: data.font_family,
          backgroundColor: data.background_color,
        });

        // Apply theme to document
        document.documentElement.style.setProperty(
          "--font-family",
          data.font_family
        );
        document.body.style.backgroundColor = data.background_color;
        document.body.style.fontFamily = data.font_family;
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  return theme;
};
