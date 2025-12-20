
import React from 'react';

export const SUDAN_TRAFFIC_LOGO = (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Frame with Gold Gradient Effect */}
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#D4AF37', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#F9E076', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#AF8A2C', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#064e3b', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#022c22', stopOpacity: 1 }} />
      </linearGradient>
    </defs>

    {/* Main Circle */}
    <circle cx="50" cy="50" r="48" fill="url(#bgGradient)" stroke="url(#goldGradient)" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />

    {/* Stylized Sudan Falcon (Hawk of the State) */}
    <g transform="translate(50, 48) scale(0.95)" fill="url(#goldGradient)">
      {/* Body and Wings */}
      <path d="M0,-25 L8,-15 L25,-12 L20,0 L35,15 L15,12 L10,25 L0,18 L-10,25 L-15,12 L-35,15 L-20,0 L-25,-12 L-8,-15 Z" />
      {/* Head */}
      <circle cx="0" cy="-28" r="5" />
      <path d="M-5,-28 Q0,-35 5,-28" fill="none" stroke="url(#goldGradient)" strokeWidth="1" />
      <path d="M0,-33 L3,-30 L0,-27 Z" />
    </g>

    {/* Central Shield with Traffic Colors */}
    <g transform="translate(50, 52)">
      <path d="M-12,-15 L12,-15 L12,5 Q12,18 0,22 Q-12,18 -12,5 Z" fill="white" stroke="#000" strokeWidth="1" />
      {/* Traffic Lights inside the Shield */}
      <circle cx="0" cy="-7" r="4" fill="#ef4444" /> {/* Red */}
      <circle cx="0" cy="2" r="4" fill="#facc15" />  {/* Yellow */}
      <circle cx="0" cy="11" r="4" fill="#22c55e" /> {/* Green */}
    </g>

    {/* Arabic Text - Sudan Police & Traffic */}
    <defs>
      <path id="textCircle" d="M 20, 50 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" />
    </defs>
    <text fill="white" fontSize="6.5" fontWeight="bold" letterSpacing="1">
      <textPath href="#textCircle" startOffset="25%" textAnchor="middle">
        شرطة السودان - SUDAN POLICE
      </textPath>
      <textPath href="#textCircle" startOffset="75%" textAnchor="middle">
        المرور - TRAFFIC
      </textPath>
    </text>

    {/* Decorative Elements */}
    <rect x="49" y="10" width="2" height="4" fill="url(#goldGradient)" rx="1" />
    <rect x="49" y="86" width="2" height="4" fill="url(#goldGradient)" rx="1" />
  </svg>
);

export const STATES = [
  "الخرطوم", "الجزيرة", "البحر الأحمر", "كسلا", "القضارف", "سنار", "النيل الأبيض", "النيل الأزرق",
  "الشمالية", "نهر النيل", "شمال كردفان", "جنوب كردفان", "غرب كردفان", "شمال دارفور", "غرب دارفور",
  "جنوب دارفور", "وسط دارفور", "شرق دارفور"
];

export const INCIDENT_TYPES = [
  "تصادم بين مركبتين", "دهس مشاة", "انقلاب", "اصطدام بجسم ثابت", "حادث مجهول", "أخرى"
];

export const INCIDENT_CAUSES = [
  "السرعة الزائدة",
  "التخطي الخاطئ",
  "عدم الانتباه والتركيز",
  "عطل ميكانيكي مفاجئ",
  "انفجار إحدى الإطارات",
  "عبور مفاجئ للمشاة",
  "عدم الالتزام بالإشارات المرورية",
  "القيادة المعاكسة",
  "عدم ترك مسافة أمان",
  "أخرى"
];

export const ROAD_CONDITIONS = ['جيدة', 'متوسطة', 'سيئة'];

export const WEATHER_CONDITIONS = ['صحو', 'ممطر', 'ضبابي', 'عاصف'];
