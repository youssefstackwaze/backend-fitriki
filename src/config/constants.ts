/**
 * Constantes de l'application
 */

import { CommissionSettings } from '../models/CommissionSettings';

// DEPRECATED: Ne plus utiliser cette constante statique
// Utiliser getCommissionRate() à la place
export const APP_COMMISSION_RATE = 0.16;

/**
 * Récupère le taux de commission dynamique depuis MongoDB
 * @returns Taux de commission actuel (valeur par défaut: 0.16 si aucun paramètre)
 */
export const getCommissionRate = async (): Promise<number> => {
  try {
    const settings = await CommissionSettings.findOne();
    return settings ? settings.rate : 0.16; // 16% par défaut
  } catch (error) {
    console.error('Erreur lors de la récupération du taux de commission:', error);
    return 0.16; // Fallback en cas d'erreur
  }
};

/**
 * Calcule la commission à partir du prix du trajet
 * Le prix du trajet est ce que le client paie
 * Commission = taux dynamique % du prix du trajet
 * 
 * Exemple: Si le prix du trajet = 1000 DA et commission = 16%
 * - Commission = 1000 × 0.16 = 160 DA
 * - Le conducteur reçoit = 1000 - 160 = 840 DA
 * 
 * @param tripPrice - Prix du trajet (ce que le client paie)
 * @param commissionRate - Taux de commission (optionnel, sinon récupéré de la DB)
 * @returns Commission de l'application
 */
export const calculateCommission = async (tripPrice: number, commissionRate?: number): Promise<number> => {
  const rate = commissionRate !== undefined ? commissionRate : await getCommissionRate();
  return tripPrice * rate;
};

/**
 * Calcule le montant que le conducteur reçoit
 * Montant conducteur = Prix du trajet - Commission
 * 
 * @param tripPrice - Prix du trajet (ce que le client paie)
 * @param commissionRate - Taux de commission (optionnel, sinon récupéré de la DB)
 * @returns Montant que le conducteur reçoit
 */
export const calculateDriverAmount = async (tripPrice: number, commissionRate?: number): Promise<number> => {
  const commission = await calculateCommission(tripPrice, commissionRate);
  return tripPrice - commission;
};

