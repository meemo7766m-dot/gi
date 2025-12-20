
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { Ornik8Data } from '../types';

/**
 * نص SQL لإنشاء الجداول المطلوبة في Supabase
 */
export const DATABASE_SCHEMA_SQL = `
-- 1. جدول البلاغات والحوادث
CREATE TABLE IF NOT EXISTS accidents (
    id UUID PRIMARY KEY,
    ornik_number TEXT NOT NULL,
    status TEXT NOT NULL,
    state TEXT NOT NULL,
    locality TEXT,
    location_description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    data_json JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. جدول الموظفين والمستخدمين
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    state TEXT,
    locality TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تعطيل الحماية مؤقتاً للتجربة (RLS)
ALTER TABLE accidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
`;

export const getSupabase = () => {
  const url = localStorage.getItem('SUPABASE_URL');
  const key = (window as any).SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_KEY');
  
  if (!url || !key || url === '' || key === '') return null;
  
  try {
    return createClient(url, key);
  } catch (e) {
    console.error("Supabase Initialization Error:", e);
    return null;
  }
};

export const testCloudConnection = async (url: string, key: string) => {
  try {
    if (!url || !key) throw new Error("Missing credentials");
    const tempClient = createClient(url, key);
    const { error } = await tempClient.from('accidents').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};

export const syncIncidentToCloud = async (incident: Ornik8Data): Promise<boolean> => {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('accidents')
      .upsert({
        id: incident.id,
        ornik_number: incident.ornikNumber,
        status: incident.status,
        state: incident.state,
        locality: incident.localArea,
        location_description: incident.location,
        latitude: incident.gps.lat,
        longitude: incident.gps.lng,
        data_json: incident,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Supabase Upsert Error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Cloud Sync Exception:', err);
    return false;
  }
};
