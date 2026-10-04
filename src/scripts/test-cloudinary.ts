import dotenv from 'dotenv';

// Charger les variables d'environnement AVANT d'importer cloudinary
dotenv.config();

import cloudinary from '../config/cloudinary';

/**
 * Script pour tester la configuration de Cloudinary
 */
async function testCloudinary() {
  console.log('🧪 Test de la configuration Cloudinary...\n');

  // Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement:');
  console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Défini' : '❌ Non défini');
  console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Défini' : '❌ Non défini');
  console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Défini' : '❌ Non défini');
  console.log('');

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Configuration Cloudinary incomplète!');
    process.exit(1);
  }

  try {
    // Test 1: Vérifier la connexion avec l'API Cloudinary
    console.log('🔗 Test 1: Connexion à l\'API Cloudinary...');
    const pingResult = await cloudinary.api.ping();
    console.log('✅ Connexion réussie!', pingResult);
    console.log('');

    // Test 2: Uploader une image de test (petit pixel transparent)
    console.log('📤 Test 2: Upload d\'une image de test...');
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImageBase64, {
      folder: 'covoiturage/test',
      public_id: 'test_image',
      overwrite: true,
    });
    
    console.log('✅ Upload réussi!');
    console.log('   URL:', uploadResult.secure_url);
    console.log('   Public ID:', uploadResult.public_id);
    console.log('');

    // Test 3: Supprimer l'image de test
    console.log('🗑️  Test 3: Suppression de l\'image de test...');
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Suppression réussie!');
    console.log('');

    console.log('🎉 Tous les tests ont réussi! Cloudinary est correctement configuré.');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Erreur lors du test Cloudinary:');
    console.error('   Message:', error.message);
    console.error('   HTTP Code:', error.http_code);
    console.error('   Error:', error.error);
    console.error('\n📋 Détails complets de l\'erreur:');
    console.error(error);
    
    console.log('\n💡 Solutions possibles:');
    console.log('   1. Vérifiez que vos identifiants Cloudinary sont corrects');
    console.log('   2. Vérifiez votre connexion internet');
    console.log('   3. Consultez https://cloudinary.com/console pour vérifier votre compte');
    
    process.exit(1);
  }
}

// Exécuter le test
testCloudinary();

