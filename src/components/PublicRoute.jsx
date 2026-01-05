import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    return <Navigate to={user.role === 'TEACHER' ? '/teacher' : '/student'} replace />;
  }
  return children;
}