
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { Ornik8Data } from '../types';

const SUPABASE_URL = 'https://rrnxpdmebtjhltigifek.supabase.co';

/**
 * الحصول على نسخة من عميل Supabase بشكل ديناميكي
 * لضمان عدم حدوث خطأ إذا لم يتم إدخال المفتاح بعد.
 */
export const getSupabase = () => {
  const key = (window as any).SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_KEY');
  if (!key) return null;
  try {
    return createClient(SUPABASE_URL, key);
  } catch (e) {
    console.error("Supabase Initialization Error:", e);
    return null;
  }
};

export const syncIncidentToCloud = async (incident: Ornik8Data) => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
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

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Cloud Sync Error:', err);
    return null;
  }
};

export const fetchCloudUsers = async () => {
  const client = getSupabase();
  if (!client) return [];
  try {
    const { data, error } = await client.from('profiles').select('*');
    if (error) return [];
    return data;
  } catch (e) {
    return [];
  }
};
