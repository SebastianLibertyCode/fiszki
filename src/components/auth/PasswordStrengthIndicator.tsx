import { Check, X } from "lucide-react";

interface PasswordRequirement {
  text: string;
  regex: RegExp;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { text: "At least 8 characters", regex: /.{8,}/ },
  { text: "Contains uppercase letter", regex: /[A-Z]/ },
  { text: "Contains lowercase letter", regex: /[a-z]/ },
  { text: "Contains number", regex: /[0-9]/ },
  { text: "Contains special character", regex: /[^A-Za-z0-9]/ },
];

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getStrengthPercentage = () => {
    if (!password) return 0;
    return (PASSWORD_REQUIREMENTS.filter((req) => req.regex.test(password)).length / PASSWORD_REQUIREMENTS.length) * 100;
  };

  const strengthPercentage = getStrengthPercentage();
  const strengthColor =
    strengthPercentage === 0
      ? "bg-gray-200"
      : strengthPercentage <= 40
      ? "bg-red-500"
      : strengthPercentage <= 80
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="space-y-3">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strengthColor}`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>
      <ul className="space-y-1 text-sm">
        {PASSWORD_REQUIREMENTS.map((requirement, index) => {
          const isMet = requirement.regex.test(password);
          return (
            <li key={index} className="flex items-center gap-2">
              {isMet ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-gray-400" />
              )}
              <span className={isMet ? "text-green-700" : "text-gray-500"}>{requirement.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 