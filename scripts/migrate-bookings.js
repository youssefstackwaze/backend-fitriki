const mongoose = require('mongoose');
const { calculateCommission, calculateDriverAmount } = require('../dist/config/constants');

// Connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/covoiturage';
console.log('🔗 Connexion à MongoDB:', MONGODB_URI);

mongoose.connect(MONGODB_URI);

const Booking = require('../dist/models/Booking').default;

async function migrateBookings() {
  try {
    console.log('🔄 Début de la migration des réservations...');
    
    // Trouver toutes les réservations qui n'ont pas appCommission ou driverAmount
    const bookingsToUpdate = await Booking.find({
      $or: [
        { appCommission: { $exists: false } },
        { appCommission: null },
        { driverAmount: { $exists: false } },
        { driverAmount: null }
      ]
    });

    console.log(`📊 ${bookingsToUpdate.length} réservations à migrer`);

    for (const booking of bookingsToUpdate) {
      try {
        // Calculer les valeurs manquantes
        const appCommission = calculateCommission(booking.totalPrice);
        const driverAmount = calculateDriverAmount(booking.totalPrice);

        // Mettre à jour la réservation
        await Booking.findByIdAndUpdate(booking._id, {
          appCommission,
          driverAmount
        });

        console.log(`✅ Réservation ${booking._id} migrée - Commission: ${appCommission.toFixed(2)} DA, Conducteur: ${driverAmount.toFixed(2)} DA`);
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de la réservation ${booking._id}:`, error.message);
      }
    }

    console.log('🎉 Migration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrateBookings();
