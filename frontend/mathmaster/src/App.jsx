import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import RegistrationSuccess from './pages/RegistrationSuccess';
import StudentDashboard from './pages/StudentDashboard';
import LessonsPage from './pages/LessonsPage';
import LessonDetailPage from './pages/LessonDetailPage';
import QuizzesPage from './pages/QuizzesPage';
import QuizDetailPage from './pages/QuizDetailPage';
import PerformancePage from './pages/PerformancePage';
import TeacherDashboard from './pages/TeacherDashboard';
import TopicDetails from './pages/TopicDetails';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/register-success" element={<RegistrationSuccess />} />
      <Route
        path="/topics"
        element={
          <ProtectedRoute>
            <TopicDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/topics/:topicId"
        element={
          <ProtectedRoute>
            <TopicDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/topics/:topicId/lessons"
        element={
          <ProtectedRoute>
            <LessonsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lessons/:lessonId"
        element={
          <ProtectedRoute>
            <LessonDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lessons/:lessonId/quizzes"
        element={
          <ProtectedRoute>
            <QuizzesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes/:quizId"
        element={
          <ProtectedRoute>
            <QuizDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <PerformancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

