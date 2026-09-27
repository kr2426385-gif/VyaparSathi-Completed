import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateMLProvenance } from '../../utils/mlLocalization.js';

/**
 * DataStatusBadge
 * Displays transparent indication of data integrity localized in MR, HI, EN:
 * - 'verified': Officially verified data from government sources (APMC, MoFPI, SLBC)
 * - 'estimated': Deterministic mathematical modeling / verified benchmark
 * - 'limited': Insufficient data; requires entrepreneur field validation
 */
export default function DataStatusBadge() {
  return null;
}
