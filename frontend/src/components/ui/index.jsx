import React from 'react';

/**
 * Button Component with touch and hover scaling
 */
export const Button = ({ children, className = '', variant = 'default', ...props }) => {
  const base = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 text-sm sm:text-[15px] leading-normal focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-98 px-4 py-2 border select-none";
  const variants = {
    default: "bg-primary text-white border-transparent hover:bg-primary-dark",
    secondary: "bg-secondary text-white border-transparent hover:bg-secondary-dark",
    outline: "border-stone-300 text-stone-700 bg-white hover:bg-stone-50",
    danger: "bg-danger text-white border-transparent hover:bg-red-700",
    ghost: "text-stone-600 border-transparent hover:bg-stone-100 hover:text-stone-900"
  };
  return (
    <button className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </button>
  );
};

/**
 * Card wrappers
 */
export const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-4 border-b border-stone-100 bg-stone-50/50 ${className}`} {...props}>{children}</div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`font-bold text-[18px] sm:text-[19px] text-stone-900 leading-snug flex items-center gap-2 ${className}`} {...props}>{children}</h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm sm:text-[15px] font-normal text-stone-500 mt-1 leading-relaxed ${className}`} {...props}>{children}</p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-4 ${className}`} {...props}>{children}</div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`p-4 border-t border-stone-100 bg-stone-50/50 ${className}`} {...props}>{children}</div>
);

/**
 * Inputs & Forms
 */
export const Input = React.forwardRef(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full px-3 py-2 border border-stone-300 rounded-lg text-sm sm:text-base bg-white placeholder:text-sm placeholder-stone-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

export const Select = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div className="relative w-full">
    <select
      ref={ref}
      className={`w-full px-3 py-2 border border-stone-300 rounded-lg text-sm sm:text-base bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none pr-8 ${className}`}
      {...props}
    >
      {children}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-500 font-bold">
      ▾
    </div>
  </div>
));
Select.displayName = 'Select';

/**
 * Progress bars
 */
export const Progress = ({ value = 0, className = '', color = 'bg-primary' }) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  return (
    <div className={`w-full bg-stone-200 rounded-full h-3 overflow-hidden ${className}`}>
      <div 
        className={`h-full transition-all duration-300 ${color}`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

/**
 * Alerts
 */
export const Alert = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: "bg-blue-50 border-l-4 border-secondary text-blue-800 p-4 rounded-r-lg",
    warning: "bg-orange-50 border-l-4 border-warning text-orange-800 p-4 rounded-r-lg",
    danger: "bg-red-50 border-l-4 border-danger text-red-800 p-4 rounded-r-lg",
    success: "bg-green-50 border-l-4 border-primary text-green-800 p-4 rounded-r-lg"
  };
  return (
    <div className={`${variants[variant] || variants.default} ${className}`} role="alert">
      {children}
    </div>
  );
};

/**
 * Badges
 */
export const Badge = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: "bg-stone-100 text-stone-800",
    primary: "bg-green-100 text-green-800 border-green-200 border",
    secondary: "bg-blue-100 text-blue-800 border-blue-200 border",
    warning: "bg-orange-100 text-orange-800 border-orange-200 border",
    danger: "bg-red-100 text-red-800 border-red-200 border"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

/**
 * Responsive Table Layouts
 */
export const Table = ({ children, className = '' }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-stone-200">
    <table className={`w-full text-left border-collapse ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children }) => <thead className="bg-stone-100 text-stone-700 text-sm font-semibold uppercase">{children}</thead>;
export const TableBody = ({ children }) => <tbody className="divide-y divide-stone-200 bg-white text-stone-800 text-base">{children}</tbody>;
export const TableRow = ({ children, className = '' }) => <tr className={`hover:bg-stone-50/50 ${className}`}>{children}</tr>;
export const TableHead = ({ children, className = '' }) => <th className={`p-3 font-semibold ${className}`}>{children}</th>;
export const TableCell = ({ children, className = '' }) => <td className={`p-3 align-middle ${className}`}>{children}</td>;

/**
 * Numeric Sliders
 */
export const Slider = ({ min, max, step, value, onChange, className = '', label = '', displayVal = '' }) => (
  <div className={`w-full ${className}`}>
    <div className="flex justify-between items-center mb-1.5 text-stone-700 font-semibold text-sm">
      <span>{label}</span>
      {displayVal && <span className="text-secondary font-bold">{displayVal}</span>}
    </div>
    <input 
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

/**
 * Scroll containers
 */
export const ScrollArea = ({ children, className = '', maxHeight = 'max-h-96' }) => (
  <div className={`overflow-y-auto pr-1 ${maxHeight} ${className}`}>
    {children}
  </div>
);

/**
 * Tooltip hover components
 */
export const Tooltip = ({ children, content, className = '' }) => (
  <div className={`relative group inline-block ${className}`}>
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-stone-800 text-white text-xs rounded py-1 px-2 z-50 whitespace-nowrap shadow-md pointer-events-none">
      {content}
    </div>
  </div>
);

/**
 * Dialog (Modals)
 */
export const Dialog = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-opacity">
      <div className={`bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all border border-stone-200 ${className}`}>
        <div className="flex justify-between items-center p-4 border-b border-stone-100 bg-stone-50/50">
          <h3 className="font-bold text-lg sm:text-[19px] text-stone-900 leading-snug">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-stone-500 hover:text-stone-800 focus:outline-none rounded-lg p-1 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold text-xl"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Stepper, Step, StepActions } from './stepper.jsx';
export { useStepper, StepperContext } from './StepperContext.jsx';

