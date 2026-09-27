import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';

/**
 * RoleGuard Component
 * 
 * Enforces frontend route protection:
 * 1. If unauthenticated -> redirects to home with option to open login.
 * 2. If authenticated but role not permitted -> displays an authoritative Access Restricted screen
 *    with information about required role credentials and quick return options.
 * 3. If authorized -> renders child components seamlessly.
 * 
 * Note: Backend APIs independently enforce 401/403 cryptographic JWT authorization.
 */
export default function RoleGuard({ 
  user, 
  allowedRoles = [], 
  children, 
  onOpenAuth, 
  fallbackPath = '/' 
}) {
  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-16 p-6 sm:p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200 shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#0b2545] flex items-center justify-center mx-auto">
          <KeyRound size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-stone-900">
            Authentication Required
          </h2>
          <p className="text-sm text-stone-600">
            Please log in with an authorized account to access this service portal.
          </p>
        </div>
        {onOpenAuth ? (
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="px-6 py-2.5 rounded-xl bg-[#0b2545] text-white text-sm font-bold shadow-sm hover:bg-[#13315c] transition-colors"
          >
            Log In to Portal
          </button>
        ) : (
          <Navigate to={fallbackPath} replace />
        )}
      </div>
    );
  }

  const userRole = user.role || 'entrepreneur';

  if (!allowedRoles.includes(userRole)) {
    const roleLabels = {
      entrepreneur: 'Rural Entrepreneur',
      advisor: 'District DIC Advisor',
      banker: 'Bank Credit Officer',
      admin: 'Administrator'
    };

    return (
      <div className="max-w-2xl mx-auto my-16 p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-rose-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800">
            HTTP 403 Forbidden • Access Restricted
          </span>
          <h2 className="text-2xl font-black text-stone-900">
            Unauthorized Role Privileges
          </h2>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Your current authenticated persona is <strong className="text-stone-900">{roleLabels[userRole] || userRole}</strong>. 
            This portal is restricted to authorized <strong className="text-[#0b2545]">{allowedRoles.map(r => roleLabels[r] || r).join(' or ')}</strong> credentials.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600 max-w-lg mx-auto text-left space-y-1">
          <p><strong>Authenticated User:</strong> {user.name} ({user.email})</p>
          <p><strong>Assigned Role:</strong> <span className="font-mono font-bold text-stone-800">{userRole}</span></p>
          <p><strong>Required Privilege:</strong> <span className="font-mono font-bold text-[#0b2545]">{allowedRoles.join(' | ')}</span></p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold transition-colors"
          >
            <ArrowLeft size={14} /> Return to Home
          </a>
          {onOpenAuth && (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="px-5 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-colors shadow-xs"
            >
              Switch Role / Demo Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return children;
}
