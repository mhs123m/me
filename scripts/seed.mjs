// scripts/seed.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars from .env.local manually (dotenv not installed)
const envFile = readFileSync(join(__dirname, '../.env.local'), 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(s => s.trim()))
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const posts = JSON.parse(
  readFileSync(join(__dirname, '../src/data/blogs.json'), 'utf8')
);

// Strip the id field — Supabase generates its own
const rows = posts.map(({ id, ...rest }) => rest);

const { data, error } = await supabase.from('posts').insert(rows).select();
if (error) {
  console.error('Seed failed:', error.message);
  process.exit(1);
}
console.log(`Seeded ${data.length} posts successfully.`);
