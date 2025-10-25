import React from "react";

interface CarIconProps {
  className?: string;
  size?: number;
}

const CarIcon: React.FC<CarIconProps> = ({ className = "", size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Car Body */}
      <path
        d="M15 35 C15 30, 20 25, 30 25 L70 25 C80 25, 85 30, 85 35 L85 50 C85 55, 80 60, 70 60 L30 60 C20 60, 15 55, 15 50 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Windshield */}
      <path
        d="M25 35 L35 25 L65 25 L75 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Hood */}
      <path
        d="M25 35 L15 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Trunk */}
      <path
        d="M75 35 L85 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Wheels */}
      <circle
        cx="25"
        cy="60"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle
        cx="75"
        cy="60"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      
      {/* Wheel Centers */}
      <circle
        cx="25"
        cy="60"
        r="4"
        fill="currentColor"
      />
      <circle
        cx="75"
        cy="60"
        r="4"
        fill="currentColor"
      />
    </svg>
  );
};

export default CarIcon;
