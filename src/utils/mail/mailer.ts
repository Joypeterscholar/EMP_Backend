import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import config from "../../config/variables";

const createTransporter = () => {
    return nodemailer.createTransport({
        host: config.EMAIL_SERVICE,
        port: Number(config.EMAIL_PORT),
        secure: true,
        tls: {
            servername: config.EMAIL_SERVICE,
        },
        auth: {
            user: config.EMAIL_USER,
            pass: config.EMAIL_PASSWORD,
        },
    } as SMTPTransport.Options);
};

const sendPasswordResetEmail = async (email: string, resetToken: string) => {
    const resetPasswordLink = `${config.FRONTEND_URL}/new-password/${resetToken}`;
    const transporter = createTransporter();

    const mailOptions = {
        from: config.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `Click the following link to reset your password: ${resetPasswordLink}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
};

async function sendVerifyEmail(
    email: string,
    verificationToken: string,
): Promise<void> {
    const verifyEmailLink = `${config.FRONTEND_URL}/verify-email/${verificationToken}`;
    const transporter = createTransporter();

    const mailOptions = {
        from: config.EMAIL_USER,
        to: email,
        subject: 'Verify Email',
        text: `Click the following link to verify your email: ${verifyEmailLink}`,
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Error sending email verification mail');
    }
}

async function sendResetPasswordEmail(
    email: string,
    resetToken: string,
): Promise<void> {
    const resetPasswordLink = `${config.FRONTEND_URL}/new-password/${resetToken}`;
    const transporter = createTransporter();

    const mailOptions = {
        from: config.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${resetPasswordLink}`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Error sending password reset email');
    }
}

export { sendPasswordResetEmail, sendVerifyEmail, sendResetPasswordEmail };
