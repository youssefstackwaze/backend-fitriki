import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import PushToken from '../models/PushToken';
import mongoose from 'mongoose';

/**
 * Service de gestion des notifications push via Expo
 */

// Créer une instance Expo SDK
const expo = new Expo();

/**
 * Envoyer une notification push à un utilisateur spécifique
 */
export const sendPushNotification = async (
  userId: string | mongoose.Types.ObjectId,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    // Récupérer tous les tokens de l'utilisateur
    const pushTokens = await PushToken.find({ user: userId });

    if (pushTokens.length === 0) {
      console.log(`📱 Aucun push token trouvé pour l'utilisateur ${userId}`);
      return;
    }

    // Créer les messages pour chaque token
    const messages: ExpoPushMessage[] = [];

    for (const pushToken of pushTokens) {
      // Vérifier que le token est valide
      if (!Expo.isExpoPushToken(pushToken.token)) {
        console.error(`❌ Token invalide pour l'utilisateur ${userId}: ${pushToken.token}`);
        // Supprimer le token invalide
        await PushToken.findByIdAndDelete(pushToken._id);
        continue;
      }

      messages.push({
        to: pushToken.token,
        sound: 'default',
        title,
        body,
        data: data || {},
        priority: 'high',
      });
    }

    if (messages.length === 0) {
      console.log(`📱 Aucun token valide pour l'utilisateur ${userId}`);
      return;
    }

    // Envoyer les notifications par lots
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        console.log(`✅ Notification envoyée avec succès à l'utilisateur ${userId}`);
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de la notification:', error);
      }
    }

    // Gérer les tickets avec des erreurs
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (ticket.status === 'error') {
        console.error(`❌ Erreur de notification: ${ticket.message}`);
        
        // Si le token est invalide, le supprimer
        if (ticket.details?.error === 'DeviceNotRegistered') {
          const tokenToDelete = messages[i].to;
          await PushToken.findOneAndDelete({ token: tokenToDelete });
          console.log(`🗑️ Token invalide supprimé: ${tokenToDelete}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification push:', error);
  }
};

/**
 * Envoyer une notification de nouvelle réservation au conducteur
 */
export const notifyDriverNewBooking = async (
  driverId: string | mongoose.Types.ObjectId,
  passengerName: string,
  tripDetails: string,
  seats: number,
  price: number,
  tripId?: string | mongoose.Types.ObjectId,
  bookingId?: string | mongoose.Types.ObjectId
): Promise<void> => {
  const title = '🎉 Nouvelle réservation !';
  const body = `${passengerName} a réservé ${seats} place(s) pour ${tripDetails} - ${price} DA`;
  
  await sendPushNotification(driverId, title, body, {
    type: 'new_booking',
    seats,
    price,
    tripId: tripId?.toString(),
    bookingId: bookingId?.toString(),
  });
};

/**
 * Envoyer une notification de nouvelle offre de négociation au conducteur
 */
export const notifyDriverNewNegotiation = async (
  driverId: string | mongoose.Types.ObjectId,
  passengerName: string,
  tripDetails: string,
  proposedPrice: number,
  tripId?: string | mongoose.Types.ObjectId,
  negotiationId?: string | mongoose.Types.ObjectId
): Promise<void> => {
  const title = '💰 Nouvelle offre de prix';
  const body = `${passengerName} propose ${proposedPrice} DA pour ${tripDetails}`;
  
  await sendPushNotification(driverId, title, body, {
    type: 'new_negotiation',
    proposedPrice,
    tripId: tripId?.toString(),
    negotiationId: negotiationId?.toString(),
  });
};

/**
 * Envoyer une notification au passager quand le conducteur accepte sa réservation
 */
export const notifyPassengerBookingConfirmed = async (
  passengerId: string | mongoose.Types.ObjectId,
  tripDetails: string,
  bookingId?: string | mongoose.Types.ObjectId,
  tripId?: string | mongoose.Types.ObjectId
): Promise<void> => {
  const title = '✅ Réservation confirmée !';
  const body = `Le conducteur a accepté votre réservation pour ${tripDetails}`;
  
  await sendPushNotification(passengerId, title, body, {
    type: 'booking_confirmed',
    bookingId: bookingId?.toString(),
    tripId: tripId?.toString(),
  });
};

/**
 * Envoyer une notification au passager quand sa réservation est rejetée
 */
export const notifyPassengerBookingRejected = async (
  passengerId: string | mongoose.Types.ObjectId,
  tripDetails: string,
  bookingId?: string | mongoose.Types.ObjectId,
  tripId?: string | mongoose.Types.ObjectId
): Promise<void> => {
  const title = '❌ Réservation refusée';
  const body = `Désolé, le conducteur a refusé votre réservation pour ${tripDetails}`;
  
  await sendPushNotification(passengerId, title, body, {
    type: 'booking_rejected',
    bookingId: bookingId?.toString(),
    tripId: tripId?.toString(),
  });
};

/**
 * Envoyer une notification quand une négociation est acceptée
 */
export const notifyNegotiationAccepted = async (
  userId: string | mongoose.Types.ObjectId,
  tripDetails: string,
  finalPrice: number,
  isDriver: boolean,
  negotiationId?: string | mongoose.Types.ObjectId,
  tripId?: string | mongoose.Types.ObjectId
): Promise<void> => {
  const title = '🎉 Négociation acceptée !';
  const body = isDriver 
    ? `Vous avez accepté l'offre de ${finalPrice} DA pour ${tripDetails}`
    : `Votre offre de ${finalPrice} DA pour ${tripDetails} a été acceptée !`;
  
  await sendPushNotification(userId, title, body, {
    type: 'negotiation_accepted',
    finalPrice,
    negotiationId: negotiationId?.toString(),
    tripId: tripId?.toString(),
  });
};

/**
 * Envoyer une notification de contre-offre
 */
export const notifyCounterOffer = async (
  userId: string | mongoose.Types.ObjectId,
  senderName: string,
  tripDetails: string,
  counterPrice: number,
  negotiationId?: string | mongoose.Types.ObjectId,
  tripId?: string | mongoose.Types.ObjectId
): Promise<void> => {
  const title = '🔄 Nouvelle contre-offre';
  const body = `${senderName} propose ${counterPrice} DA pour ${tripDetails}`;
  
  await sendPushNotification(userId, title, body, {
    type: 'counter_offer',
    counterPrice,
    negotiationId: negotiationId?.toString(),
    tripId: tripId?.toString(),
  });
};

/**
 * Envoyer une notification quand un trajet est annulé
 */
export const notifyTripCancelled = async (
  userId: string | mongoose.Types.ObjectId,
  tripDetails: string,
  tripId?: string | mongoose.Types.ObjectId,
  reason?: string
): Promise<void> => {
  const title = '⚠️ Trajet annulé';
  const body = reason 
    ? `Le trajet ${tripDetails} a été annulé. Raison: ${reason}`
    : `Le trajet ${tripDetails} a été annulé`;
  
  await sendPushNotification(userId, title, body, {
    type: 'trip_cancelled',
    tripId: tripId?.toString(),
  });
};

/**
 * Envoyer une notification quand une négociation est refusée
 */
export const notifyNegotiationRejected = async (
  userId: string | mongoose.Types.ObjectId,
  tripDetails: string,
  negotiationId?: string | mongoose.Types.ObjectId,
  tripId?: string | mongoose.Types.ObjectId
): Promise<void> => {
  const title = '❌ Négociation refusée';
  const body = `Votre proposition pour ${tripDetails} a été refusée`;
  
  await sendPushNotification(userId, title, body, {
    type: 'negotiation_rejected',
    negotiationId: negotiationId?.toString(),
    tripId: tripId?.toString(),
  });
};

/**
 * Envoyer une notification quand une réservation est annulée
 */
export const notifyBookingCancelled = async (
  userId: string | mongoose.Types.ObjectId,
  tripDetails: string,
  cancelledBy: 'driver' | 'passenger',
  bookingId?: string | mongoose.Types.ObjectId,
  tripId?: string | mongoose.Types.ObjectId,
  reason?: string
): Promise<void> => {
  const title = '⚠️ Réservation annulée';
  const who = cancelledBy === 'driver' ? 'Le conducteur' : 'Le passager';
  const body = reason 
    ? `${who} a annulé la réservation pour ${tripDetails}. Raison: ${reason}`
    : `${who} a annulé la réservation pour ${tripDetails}`;
  
  await sendPushNotification(userId, title, body, {
    type: 'booking_cancelled',
    cancelledBy,
    bookingId: bookingId?.toString(),
    tripId: tripId?.toString(),
  });
};

/**
 * Envoyer une notification quand un trajet est terminé
 */
export const notifyTripCompleted = async (
  userId: string | mongoose.Types.ObjectId,
  tripDetails: string,
  tripId?: string | mongoose.Types.ObjectId
): Promise<void> => {
  const title = '✅ Trajet terminé !';
  const body = `Le trajet ${tripDetails} est maintenant terminé. Vous pouvez laisser un avis !`;
  
  await sendPushNotification(userId, title, body, {
    type: 'trip_completed',
    tripId: tripId?.toString(),
  });
};

/**
 * Enregistrer ou mettre à jour un push token pour un utilisateur
 */
export const registerPushToken = async (
  userId: string | mongoose.Types.ObjectId,
  token: string,
  deviceType: 'ios' | 'android' | 'web'
): Promise<void> => {
  try {
    // Vérifier si le token existe déjà
    const existingToken = await PushToken.findOne({ token });

    if (existingToken) {
      // Mettre à jour l'utilisateur associé si nécessaire
      if (existingToken.user.toString() !== userId.toString()) {
        existingToken.user = userId as mongoose.Types.ObjectId;
        await existingToken.save();
        console.log(`📱 Token réassigné à l'utilisateur ${userId}`);
      }
    } else {
      // Créer un nouveau token
      await PushToken.create({
        user: userId,
        token,
        deviceType,
      });
      console.log(`📱 Nouveau token enregistré pour l'utilisateur ${userId}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement du token:', error);
    throw error;
  }
};

/**
 * Supprimer un push token (lors de la déconnexion par exemple)
 */
export const unregisterPushToken = async (token: string): Promise<void> => {
  try {
    await PushToken.findOneAndDelete({ token });
    console.log(`🗑️ Token supprimé: ${token}`);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du token:', error);
    throw error;
  }
};

