import React from 'react';

export const SUDAN_TRAFFIC_LOGO = (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Blue Ring */}
    <circle cx="50" cy="50" r="48" fill="none" stroke="#000080" strokeWidth="3" />
    {/* Inner White Ring */}
    <circle cx="50" cy="50" r="45" fill="white" />
    {/* Black Background Circle */}
    <circle cx="50" cy="50" r="42" fill="black" />
    
    {/* Simplified Sudan Map Shape */}
    <path 
      d="M35,30 L45,28 L55,25 L65,28 L72,35 L75,45 L70,55 L75,65 L70,75 L60,80 L50,82 L40,78 L32,70 L28,60 L28,45 L32,35 Z" 
      fill="white" 
    />
    
    {/* Traffic Light Symbols (Stylized) */}
    <g transform="translate(42, 35)">
      {/* Red Light */}
      <circle cx="8" cy="5" r="4" fill="#FF0000" />
      {/* Yellow Light */}
      <circle cx="8" cy="15" r="4" fill="#FFFF00" />
      {/* Green Light */}
      <circle cx="8" cy="25" r="4" fill="#008000" />
      
      {/* Vertical Support Lines */}
      <path d="M4,5 L4,30 M12,5 L12,30" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
    </g>
    
    {/* Eye Symbol at Bottom */}
    <path 
      d="M35,70 Q50,60 65,70 Q50,80 35,70" 
      fill="none" 
      stroke="#1a1a1a" 
      strokeWidth="2" 
    />
    <circle cx="50" cy="70" r="3.5" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
    
    {/* Border highlight */}
    <circle cx="50" cy="50" r="48.5" fill="none" stroke="#000080" strokeWidth="0.5" opacity="0.5" />
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