const nodemailer = require('nodemailer');

exports.sendConfirmationEmail = async (email, token) => {
    // Le lien sur lequel l'utilisateur devra cliquer
    const confirmationUrl = `http://localhost:3000/api/auth/verify-email/${token}`;
    
    console.log("📨 Tentative d'envoi d'e-mail de confirmation à :", email);

    // On configure le "facteur" (transporteur) avec les infos de ton .env
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 5000 // On n'attend pas plus de 5 secondes
    });

    try {
        // Tentative d'envoi réel via Mailtrap
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Bienvenue chez Althea Systems - Confirmez votre compte',
            html: `
                <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
                    <h2 style="color: #2c3e50;">Bienvenue !</h2>
                    <p>Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
                    <a href="${confirmationUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Confirmer mon compte
                    </a>
                    <p><br>Ou copiez ce lien dans votre navigateur : ${confirmationUrl}</p>
                </div>
            `
        });
        console.log("✅ E-mail envoyé avec succès dans Mailtrap !");
    } catch (error) {
        // Si ton pare-feu bloque le port SMTP, on affiche le lien dans la console
        console.warn("⚠️ Connexion SMTP bloquée. Utilisation du Mode Démo.");
        console.log("🔗 LIEN DE VALIDATION GÉNÉRÉ :", confirmationUrl);
    }
};