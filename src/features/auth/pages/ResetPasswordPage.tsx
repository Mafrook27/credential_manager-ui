import { useState } from 'react';
import AuthLayout from '../../../layouts/AuthLayout';
import ResetPasswordForm from '../components/ResetPasswordForm';

function ResetPasswordPage() {
  const [step] = useState(1); // This could be managed by the form component

  return (
    <AuthLayout 
      image={step === 1 ? "/forget.svg" : "/register.svg"}
      title={step === 1 ? "Forgot Your Password?" : "Verify Reset Code"}
      subtitle={step === 1 ? "Don't worry, we'll help you reset it." : "Enter the code sent to your email"}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export default ResetPasswordPage;