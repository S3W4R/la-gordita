import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const admins = [
      { email: 'war1983es@hotmail.com', password: 'P4SSW0rd' },
      { email: 'alberto.gpmm@gmail.com', password: 'P4SSW0rd' },
      { email: 'krisyalber@gmail.com', password: 'P4SSW0rd' },
      { email: 'hoypormifuturo@gmail.com', password: 'eliuth1234' },
      { email: 'malaga.adt@gmail.com', password: 'P4SSW0rd' },
    ];

    const results = [];

    for (const admin of admins) {
      console.log(`Creating admin user: ${admin.email}`);
      
      // Create user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
      });

      if (userError) {
        console.error(`Error creating user ${admin.email}:`, userError);
        results.push({ email: admin.email, success: false, error: userError.message });
        continue;
      }

      if (!userData.user) {
        results.push({ email: admin.email, success: false, error: 'No user data returned' });
        continue;
      }

      console.log(`User created successfully: ${admin.email}, ID: ${userData.user.id}`);

      // Assign admin role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: 'admin'
        });

      if (roleError) {
        console.error(`Error assigning admin role to ${admin.email}:`, roleError);
        results.push({ 
          email: admin.email, 
          success: false, 
          userId: userData.user.id,
          error: `User created but role assignment failed: ${roleError.message}` 
        });
        continue;
      }

      console.log(`Admin role assigned successfully to ${admin.email}`);
      results.push({ 
        email: admin.email, 
        success: true, 
        userId: userData.user.id 
      });
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in create-admin-users function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});