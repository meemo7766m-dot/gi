
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
      console.warn("Cloud user sync failed");
    }
  }
};

export const deleteUser = async (id: string) => {
  const users = getAllUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const toggleUserStatus = (id: string) => {
  const users = getAllUsers();
  const user = users.find(u => u.id === id);
  if (user) {
    user.isActive = !user.isActive;
    saveUser(user);
  }
};

/**
 * وظيفة التصحيح القومي: تضمن بقاء حساب 'officer' في بوابة الميدان دائماً
 */
export const ensureDefaultUsers = () => {
  let users = getAllUsers();
  
  const defaults: User[] = [
    {
      id: 'off-001',
      fullName: 'ملازم أول/ أحمد علي (ميدان)',
      username: 'officer',
      role: UserRole.OFFICER,
      state: 'الخرطوم',
      locality: 'الخرطوم',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'sup-001',
      fullName: 'عقيد/ عمر حسن (مشرف)',
      username: 'supervisor',
      role: UserRole.SUPERVISOR,
      state: 'الخرطوم',
      locality: 'رئاسة العمليات',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'inv-001',
      fullName: 'خبير/ محمد إبراهيم (محقق)',
      username: 'investigator',
      role: UserRole.INVESTIGATOR,
      state: 'الخرطوم',
      locality: 'المعمل الجنائي',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rec-001',
      fullName: 'مساعد/ خالد يوسف (سجلات)',
      username: 'records',
      role: UserRole.RECORDS,
      state: 'الخرطوم',
      locality: 'قسم الأرشفة',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
        id: 'admin-001',
        fullName: 'المدير العام (تحكم)',
        username: 'admin',
        role: UserRole.ADMIN,
        state: 'الخرطوم',
        locality: 'الرئاسة',
        isActive: true,
        createdAt: new Date().toISOString()
    }
  ];

  defaults.forEach(def => {
    const existingIndex = users.findIndex(u => u.username === def.username);
    if (existingIndex > -1) {
      // تصحيح فوري للدور في حال وجود تداخل قديم
      users[existingIndex].role = def.role;
      users[existingIndex].fullName = def.fullName;
      users[existingIndex].isActive = true;
    } else {
      users.push(def);
    }
  });

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

ensureDefaultUsers();
