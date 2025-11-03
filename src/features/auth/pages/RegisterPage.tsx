import AuthLayout from '../../../layouts/AuthLayout';
import RegisterForm from '../components/RegisterForm';

function RegisterPage() {
  return (
    <AuthLayout 
      image="/register.svg"
      title="Join Us Today"
      subtitle="Start managing your credentials securely."
    >
      <RegisterForm />
    </AuthLayout>
  );
}

export default RegisterPage;