import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Импортируй компоненты
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Страницы
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import LessonConstructor from './pages/LessonConstructor'; 
import LessonPlayer from './pages/LessonPlayer'; 
import GroupPage from './pages/GroupPage';         

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        
        {/* Ученик */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/lessons/:lessonId"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <LessonPlayer />
            </ProtectedRoute>
          }
        />

        {/* Учитель */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRole="TEACHER">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/lessons/new"
          element={
            <ProtectedRoute allowedRole="TEACHER">
              <LessonConstructor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}