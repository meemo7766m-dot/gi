
import { UserRole } from '../types';
import { getSupabase } from './supabase';

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
  state: string;
  locality: string;
  isActive: boolean;
  createdAt: string;
}

const USERS_KEY = 'sudanese_traffic_users';

export const getAllUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUser = async (user: User) => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  if (index > -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // محاولة المزامنة مع Supabase إذا كان العميل متاحاً
  const client = getSupabase();
  if (client) {
    try {
      await client.from('profiles').upsert({
        id: user.id,
        full_name: user.fullName,
        username: user.username,
        role: user.role,
        state: user.state,
        locality: user.locality,
        is_active: user.isActive
      });
    } catch (e) {
      console.warn("Cloud user sync failed, kept locally");
    }
  }
};

export const deleteUser = async (id: string) => {
  const users = getAllUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const client = getSupabase();
  if (client) {
    try {
      await client.from('profiles').delete().eq('id', id);
    } catch (e) {}
  }
};

export const toggleUserStatus = (id: string) => {
  const users = getAllUsers();
  const user = users.find(u => u.id === id);
  if (user) {
    user.isActive = !user.isActive;
    saveUser(user);
  }
};

// تهيئة المدير الافتراضي عند أول تشغيل
const init = () => {
  if (getAllUsers().length === 0) {
    // نستخدم النسخة المحلية فقط للتهيئة لتجنب انتظار السحابة
    const admin = {
      id: 'admin-001',
      fullName: 'مدير النظام المركزي',
      username: 'admin',
      role: UserRole.ADMIN,
      state: 'الخرطوم',
      locality: 'الرئاسة',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    const users = [admin];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};
init();
