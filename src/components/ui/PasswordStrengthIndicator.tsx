"use client";

import React from 'react';
import { Check, X } from 'lucide-react';
import { validatePassword, getPasswordStrength, PasswordRequirement } from '@/lib/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({ password, showRequirements = true }: PasswordStrengthIndicatorProps) {
  const { isValid, requirements } = validatePassword(password);
  const { level, score } = getPasswordStrength(password);

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'weak': return 'bg-rose-500';
      case 'fair': return 'bg-amber-500';
      case 'good': return 'bg-amber-400';
      case 'strong': return 'bg-emerald-500';
      default: return 'bg-[var(--surface-3)]';
    }
  };

  const getStrengthText = (level: string) => {
    switch (level) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Password Strength</span>
          <span className={`font-medium ${
            level === 'weak' ? 'text-rose-400' :
            level === 'fair' ? 'text-amber-400' :
            level === 'good' ? 'text-amber-300' :
            'text-emerald-400'
          }`}>
            {getStrengthText(level)}
          </span>
        </div>
        <div className="w-full bg-[var(--surface-3)] rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(level)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Password Requirements:</p>
          <div className="space-y-1">
            {requirements.map((requirement) => (
              <div key={requirement.id} className="flex items-center space-x-2 text-sm">
                {requirement.met ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-rose-400" />
                )}
                <span className={requirement.met ? 'text-emerald-400' : 'text-rose-400'}>
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordStrengthIndicator;