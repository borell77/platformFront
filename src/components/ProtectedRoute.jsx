import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'TEACHER' ? '/teacher' : '/student'} replace />;
  }

  return children;
}