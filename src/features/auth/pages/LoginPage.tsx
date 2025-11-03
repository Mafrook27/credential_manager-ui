
import AuthLayout from '../../../layouts/AuthLayout';
import LoginForm from '../components/LoginForm';

function LoginPage() {
  return (
    <AuthLayout 
      image="/login.svg"
      title="Secure Your Digital Life"
      subtitle="Manage all your passwords in one secure place."
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default LoginPage;