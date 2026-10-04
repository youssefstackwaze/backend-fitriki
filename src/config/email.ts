import nodemailer from 'nodemailer';
import twilio from 'twilio';

/**
 * Configuration des services d'envoi (Email et SMS)
 */

// Créer un transporteur email
export const createEmailTransporter = () => {
  // En développement, utiliser un compte de test (Ethereal)
  // En production, utiliser un vrai service SMTP
  
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    // Configuration pour production (ex: Gmail, SendGrid, AWS SES)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true pour port 465, false pour autres ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Configuration pour développement (Gmail avec app password)
    // OU utiliser Mailtrap, Ethereal pour tests
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Pour Gmail: utilisez un "App Password"
      },
    });
  }
};

/**
 * Envoyer un email de vérification
 */
export const sendVerificationEmail = async (
  to: string,
  code: string,
  firstName: string
): Promise<void> => {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'Covoiturage'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Vérification de votre email',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #007bff;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #007bff;
              text-align: center;
              padding: 20px;
              background-color: #e7f3ff;
              border-radius: 5px;
              letter-spacing: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 ${process.env.APP_NAME || 'Covoiturage'}</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${firstName},</h2>
              <p>Merci de vous être inscrit sur notre plateforme de covoiturage !</p>
              <p>Pour vérifier votre adresse email, veuillez utiliser le code suivant :</p>
              
              <div class="code">${code}</div>
              
              <p><strong>Ce code expirera dans 15 minutes.</strong></p>
              
              <p>Si vous n'avez pas demandé cette vérification, ignorez simplement cet email.</p>
              
              <p>Cordialement,<br>L'équipe ${process.env.APP_NAME || 'Covoiturage'}</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Bonjour ${firstName},
      
      Merci de vous être inscrit sur notre plateforme de covoiturage !
      
      Pour vérifier votre adresse email, veuillez utiliser le code suivant :
      
      ${code}
      
      Ce code expirera dans 15 minutes.
      
      Si vous n'avez pas demandé cette vérification, ignorez simplement cet email.
      
      Cordialement,
      L'équipe ${process.env.APP_NAME || 'Covoiturage'}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de vérification envoyé à ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    // En développement, afficher aussi dans la console
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔑 Code de vérification: ${code}`);
    }
  } catch (error) {
    console.log(error);
    //console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    //throw new Error('Impossible d\'envoyer l\'email de vérification');
  }
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
export const sendPasswordResetEmail = async (
  to: string,
  code: string,
  firstName: string
): Promise<void> => {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'Covoiturage'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #dc2626;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #dc2626;
              text-align: center;
              padding: 20px;
              background-color: #fee;
              border-radius: 5px;
              letter-spacing: 5px;
              margin: 20px 0;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 16px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 ${process.env.APP_NAME || 'Covoiturage'}</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${firstName},</h2>
              <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
              <p>Pour réinitialiser votre mot de passe, veuillez utiliser le code suivant :</p>
              
              <div class="code">${code}</div>
              
              <p><strong>Ce code expirera dans 15 minutes.</strong></p>
              
              <div class="warning">
                <p><strong>⚠️ Attention :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.</p>
              </div>
              
              <p>Pour des raisons de sécurité, ne partagez jamais ce code avec quiconque.</p>
              
              <p>Cordialement,<br>L'équipe ${process.env.APP_NAME || 'Covoiturage'}</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Bonjour ${firstName},
      
      Vous avez demandé la réinitialisation de votre mot de passe.
      
      Pour réinitialiser votre mot de passe, veuillez utiliser le code suivant :
      
      ${code}
      
      Ce code expirera dans 15 minutes.
      
      ⚠️ ATTENTION : Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.
      
      Pour des raisons de sécurité, ne partagez jamais ce code avec quiconque.
      
      Cordialement,
      L'équipe ${process.env.APP_NAME || 'Covoiturage'}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de réinitialisation envoyé à ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    // En développement, afficher aussi dans la console
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔑 Code de réinitialisation: ${code}`);
    }
  } catch (error) {
    console.log(error);
    //console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    //throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
  }
};

/**
 * Créer un client Twilio
 */
const createTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

/**
 * Envoyer un SMS de vérification
 */
export const sendVerificationSMS = async (
  phoneNumber: string,
  code: string
): Promise<void> => {
  const twilioClient = createTwilioClient();

  // Si Twilio est configuré, envoyer un vrai SMS
  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      // S'assurer que le numéro commence par +
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const message = await twilioClient.messages.create({
        body: `Votre code de vérification ${process.env.APP_NAME || 'Covoiturage'}: ${code}. Expire dans 15 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });

      console.log(`✅ SMS envoyé à ${phoneNumber}`);
      console.log(`📱 Message SID: ${message.sid}`);
      
      // En développement, afficher aussi le code
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔑 Code: ${code}`);
      }
      
      return;
    } catch (error: any) {
      console.error('❌ Erreur Twilio:', error.message);
      // Continuer avec le fallback (console)
    }
  }

  // Fallback : afficher dans la console (développement)
  console.log(`\n📱 SMS de vérification (Simulé)`);
  console.log(`📞 Pour: ${phoneNumber}`);
  console.log(`🔑 Code: ${code}`);
  console.log(`⏰ Expire dans 15 minutes\n`);
  console.log(`💡 Conseil: Configurez Twilio pour envoyer de vrais SMS (voir backend/SMS_CONFIG.md)\n`);
};

/**
 * Envoyer un email avec les identifiants de connexion à un nouvel admin
 */
export const sendAdminCredentialsEmail = async (
  to: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: string,
  wilaya?: string
): Promise<void> => {
  const transporter = createEmailTransporter();

  const roleLabel = role === 'super_admin' ? 'Super Administrateur' : 'Administrateur';
  const roleColor = role === 'super_admin' ? '#DC2626' : '#2563EB';
  const roleIcon = role === 'super_admin' ? '👑' : '🛡️';

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'Covoiturage Admin'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: `🎉 Bienvenue - Accès ${roleLabel}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a2e;
              background-color: #f5f7fa;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, ${roleColor} 0%, ${roleColor}dd 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 28px;
              font-weight: 800;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .header .subtitle {
              font-size: 16px;
              opacity: 0.95;
              font-weight: 500;
            }
            .content {
              padding: 40px 30px;
            }
            .welcome-message {
              text-align: center;
              margin-bottom: 30px;
            }
            .welcome-message .icon {
              font-size: 64px;
              margin-bottom: 16px;
            }
            .welcome-message h2 {
              font-size: 24px;
              color: #1a1a2e;
              margin-bottom: 12px;
              font-weight: 700;
            }
            .welcome-message p {
              color: #5f6368;
              font-size: 16px;
              line-height: 1.5;
            }
            .role-badge {
              display: inline-block;
              background-color: ${roleColor}15;
              color: ${roleColor};
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 700;
              font-size: 14px;
              margin: 20px 0;
              border: 2px solid ${roleColor}30;
            }
            .credentials-box {
              background: linear-gradient(135deg, #f8f9fa 0%, #e8eaed 100%);
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
              border: 2px solid #e8eaed;
            }
            .credentials-box h3 {
              color: #1a1a2e;
              font-size: 18px;
              margin-bottom: 20px;
              font-weight: 700;
              text-align: center;
            }
            .credential-item {
              background-color: white;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 12px;
              border: 1px solid #d1d5db;
            }
            .credential-item:last-child {
              margin-bottom: 0;
            }
            .credential-label {
              font-size: 12px;
              color: #5f6368;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            }
            .credential-value {
              font-size: 16px;
              color: #1a1a2e;
              font-weight: 600;
              word-break: break-all;
            }
            .warning-box {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 16px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .warning-box p {
              color: #92400e;
              font-size: 14px;
              margin: 0;
            }
            .warning-box strong {
              color: #78350f;
            }
            .info-section {
              background-color: #f0f7ff;
              border-left: 4px solid #2563eb;
              padding: 16px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .info-section p {
              color: #1e40af;
              font-size: 14px;
              margin: 8px 0;
            }
            .info-section p:first-child {
              margin-top: 0;
            }
            .info-section p:last-child {
              margin-bottom: 0;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e8eaed;
            }
            .footer p {
              color: #5f6368;
              font-size: 13px;
              margin: 6px 0;
            }
            .footer .app-name {
              font-weight: 700;
              color: #1a1a2e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${roleIcon} ${process.env.APP_NAME || 'Covoiturage'}</h1>
              <div class="subtitle">Plateforme d'Administration</div>
            </div>
            
            <div class="content">
              <div class="welcome-message">
                <div class="icon">🎉</div>
                <h2>Bienvenue ${firstName} ${lastName} !</h2>
                <p>Votre compte administrateur a été créé avec succès.</p>
                <div class="role-badge">${roleIcon} ${roleLabel}</div>
              </div>

              ${wilaya ? `
                <div class="info-section">
                  <p><strong>📍 Wilaya assignée :</strong> ${wilaya}</p>
                  <p>Vous gérez les utilisateurs de cette wilaya.</p>
                </div>
              ` : ''}

              <div class="credentials-box">
                <h3>🔐 Vos identifiants de connexion</h3>
                
                <div class="credential-item">
                  <div class="credential-label">📧 Adresse Email</div>
                  <div class="credential-value">${email}</div>
                </div>
                
                <div class="credential-item">
                  <div class="credential-label">🔑 Mot de passe</div>
                  <div class="credential-value">${password}</div>
                </div>
              </div>

              <div class="warning-box">
                <p><strong>⚠️ Important :</strong> Pour des raisons de sécurité, nous vous recommandons fortement de <strong>changer votre mot de passe</strong> dès votre première connexion.</p>
              </div>

              <div class="info-section">
                <p><strong>📱 Que pouvez-vous faire ?</strong></p>
                <p>• Gérer les utilisateurs de votre zone</p>
                <p>• Consulter les statistiques</p>
                <p>• Modérer les contenus et trajets</p>
                <p>• Gérer les commissions</p>
              </div>
            </div>

            <div class="footer">
              <p class="app-name">${process.env.APP_NAME || 'Covoiturage'}</p>
              <p>Cet email contient des informations confidentielles.</p>
              <p>Si vous n'êtes pas le destinataire, veuillez l'ignorer.</p>
              <p style="margin-top: 16px; color: #9aa0a6;">
                © ${new Date().getFullYear()} Tous droits réservés
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Bienvenue ${firstName} ${lastName} !

Votre compte ${roleLabel} a été créé avec succès sur ${process.env.APP_NAME || 'Covoiturage'}.

${wilaya ? `Wilaya assignée : ${wilaya}\n` : ''}

VOS IDENTIFIANTS DE CONNEXION :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Adresse Email : ${email}
🔑 Mot de passe : ${password}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT : 
Pour des raisons de sécurité, nous vous recommandons fortement de changer votre mot de passe dès votre première connexion.

Cordialement,
L'équipe ${process.env.APP_NAME || 'Covoiturage'}

---
Cet email contient des informations confidentielles.
Si vous n'êtes pas le destinataire, veuillez l'ignorer.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email d'identifiants envoyé à ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    // En développement, afficher aussi dans la console
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n🎉 NOUVEL ADMIN CRÉÉ`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`👤 Nom: ${firstName} ${lastName}`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Mot de passe: ${password}`);
      console.log(`👑 Rôle: ${roleLabel}`);
      if (wilaya) console.log(`📍 Wilaya: ${wilaya}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    // Ne pas bloquer la création de l'admin si l'email échoue
    console.log('⚠️ L\'admin a été créé mais l\'email n\'a pas pu être envoyé');
  }
};

