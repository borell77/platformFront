// src/pages/GroupPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем данные группы
        const groupRes = await api.get(`/groups/${groupId}`);
        setGroup(groupRes.data);
        
        if (isTeacher) {
          // Учитель: список учеников
          const studentsRes = await api.get(`/groups/${groupId}/students`);
          setStudents(studentsRes.data);
        } else {
          // Ученик: список уроков
          const lessonsRes = await api.get(`/lessons/group/${groupId}`);
          setLessons(lessonsRes.data);
        }
      } catch (err) {
        console.error('Ошибка загрузки группы:', err);
        setError('Не удалось загрузить группу');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId, isTeacher]);

  const handleCreateLesson = () => {
    navigate(`/groups/${groupId}/lessons/new`);
  };

  const handleStartLesson = (lessonId) => {
    navigate(`/groups/${groupId}/lessons/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Загрузка группы...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Шапка */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(isTeacher ? '/teacher' : '/student')} 
              className="text-gray-600 hover:text-gray-900"
            >
              ← Назад
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{group?.name}</h1>
              <p className="text-sm text-gray-500">
                {isTeacher ? 'Управление группой' : 'Ваше обучение'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Инфо о группе */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex items-start gap-4">
            <span className="text-2xl">
              {getSubjectIcon(group?.subject)}
            </span>
            <div>
              <h2 className="text-lg font-bold">{group?.name}</h2>
              <p className="text-gray-600">Предмет: {getSubjectName(group?.subject)}</p>
              
              {isTeacher && (
                <div className="mt-3">
                  <p className="text-sm">
                    <span className="font-medium">Код приглашения:</span>{' '}
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {group?.inviteCode}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Контент по роли */}
        {isTeacher ? (
          <TeacherGroupContent 
            groupId={groupId}
            students={students}
            onCreateLesson={handleCreateLesson}
          />
        ) : (
          <StudentGroupContent 
            lessons={lessons}
            onStartLesson={handleStartLesson}
          />
        )}
      </main>
    </div>
  );
}

// Вспомогательные функции
const getSubjectIcon = (subject) => {
  const icons = {
    math: '📐', russian: '📚', physics: '⚛️', chemistry: '🧪',
    biology: '🌿', history: '🏛️', social: '👥', informatics: '💻'
  };
  return icons[subject] || '📖';
};

const getSubjectName = (subject) => {
  const names = {
    math: 'Математика', russian: 'Русский язык', physics: 'Физика',
    chemistry: 'Химия', biology: 'Биология', history: 'История',
    social: 'Обществознание', informatics: 'Информатика'
  };
  return names[subject] || subject;
};

// Контент для учителя
function TeacherGroupContent({ groupId, students, onCreateLesson }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Управление</h2>
        <button
          onClick={onCreateLesson}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          + Создать урок
        </button>
      </div>

      <div>
        <h3 className="font-medium text-gray-800 mb-4">Список учеников ({students.length})</h3>
        {students.length === 0 ? (
          <p className="text-gray-600">В группе пока нет учеников</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {students.map(student => (
              <div 
                key={student.id} 
                className="p-3 bg-gray-50 rounded-lg border"
              >
                <div className="font-medium">{student.firstName} {student.lastName}</div>
                <div className="text-sm text-gray-600">@{student.username}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Контент для ученика
function StudentGroupContent({ lessons, onStartLesson }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Уроки в группе ({lessons.length})</h2>
      
      {lessons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-600">Учитель пока не добавил уроков</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map(lesson => (
            <div 
              key={lesson.id} 
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition cursor-pointer"
              onClick={() => onStartLesson(lesson.id)}
            >
              <div className="font-bold text-lg text-gray-900">{lesson.title}</div>
              <div className="text-sm text-gray-600 mt-1">
                Блоков: {lesson.blocks?.length || 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}