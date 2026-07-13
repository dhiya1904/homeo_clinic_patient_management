require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initDb() {
  console.log('Connecting to Supabase...');

  // Seed default admin user if not exists
  const { data: admin, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('username', 'admin')
    .single();

  // PGRST116 = no rows found — that's fine, we'll create the user
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking for admin user:', fetchError.message);
    return supabase;
  }

  if (!admin) {
    const hash = await bcrypt.hash('admin123', 10);
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        username: 'admin',
        email: 'admin@jirehhomoeo.com',
        password: hash,
        full_name: 'Administrator',
        role: 'admin',
        is_active: true
      }]);

    if (insertError) {
      console.error('Failed to create admin user:', insertError.message);
    } else {
      console.log('Default admin user created: admin / admin123');
    }
  }

  console.log('Supabase connection ready.');
  return supabase;
}

module.exports = { supabase, initDb };
