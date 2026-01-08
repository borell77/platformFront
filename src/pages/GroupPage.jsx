import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refreshParam = searchParams.get('refresh');

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
          // Учитель: список учеников и уроков
          const studentsRes = await api.get(`/groups/${groupId}/students`);
          setStudents(studentsRes.data);

          const lessonsRes = await api.get(`/lessons/group/${groupId}`);
          setLessons(lessonsRes.data);
        } else {
          // Ученик: список уроков с прогрессом
          const lessonsRes = await api.get(`/lessons/group/${groupId}/with-progress`);
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
  }, [groupId, isTeacher, refreshParam]);

  const handleCreateLesson = () => {
    navigate(`/groups/${groupId}/lessons/new`);
  };

  const handleViewLesson = (lessonId) => {
    navigate(`/groups/${groupId}/lessons/${lessonId}`);
  };

  const handleEditLesson = (lessonId) => {
    navigate(`/groups/${groupId}/lessons/${lessonId}/edit`);
  };

  const handleDeleteLesson = async (lessonId, event) => {
    event.stopPropagation(); // Останавливаем всплытие, чтобы не открывался урок при клике

    if (!window.confirm('Вы уверены, что хотите удалить этот урок?')) {
      return;
    }

    try {
      await api.delete(`/lessons/${lessonId}`);
      // Обновляем список уроков
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      alert('Урок успешно удалён');
    } catch (err) {
      console.error('Ошибка удаления урока:', err);
      alert('Не удалось удалить урок');
    }
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
            lessons={lessons}
            onCreateLesson={handleCreateLesson}
            onViewLesson={handleViewLesson}
            onEditLesson={handleEditLesson}
            onDeleteLesson={handleDeleteLesson}
          />
        ) : (
          <StudentGroupContent 
            lessons={lessons}
            onStartLesson={handleViewLesson}
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
function TeacherGroupContent({ groupId, students, lessons, onCreateLesson, onViewLesson, onEditLesson, onDeleteLesson }) {
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

      {/* Список уроков */}
      <div>
        <h3 className="font-medium text-gray-800 mb-4">Уроки в группе ({lessons.length})</h3>
        
        {lessons.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-gray-600">Вы пока не добавили уроков</p>
            <button
              onClick={onCreateLesson}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Создать первый урок
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map(lesson => (
              <div 
                key={lesson.id} 
                className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">{lesson.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Блоков: {lesson.blocks?.length || 0}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditLesson(lesson.id)}
                      className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={(e) => onDeleteLesson(lesson.id, e)}
                      className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Список учеников */}
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

function StudentGroupContent({ lessons, onStartLesson }) {
  const completedCount = lessons.filter(l => l.completed).length; // ← исправлено

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Уроки в группе ({lessons.length})</h2>
        <span className="text-sm text-gray-500">
          Завершено: {completedCount} из {lessons.length}
        </span>
      </div>
      
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
              className={`
                bg-white p-5 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden
                ${lesson.completed // ← исправлено
                  ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md hover:shadow-lg' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }
              `}
              onClick={() => onStartLesson(lesson.id)}
            >
              {lesson.completed && ( // ← исправлено
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-emerald-500"></div>
              )}
              
              <div className="flex justify-between items-start pl-2">
                <div>
                  <div className={`
                    font-bold text-lg transition-colors
                    ${lesson.completed // ← исправлено
                      ? 'text-green-800' 
                      : 'text-gray-900 hover:text-blue-600'
                    }
                  `}>
                    {lesson.title}
                  </div>
                  <div className={`
                    text-sm mt-1 transition-colors
                    ${lesson.completed // ← исправлено
                      ? 'text-green-700' 
                      : 'text-gray-600'
                    }
                  `}>
                    Блоков: {lesson.blocks?.length || 0}
                  </div>
                </div>
                
                {lesson.completed && ( // ← исправлено
                  <div className={`
                    w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 
                    flex items-center justify-center shadow-md transition-transform hover:scale-105
                  `}>
                    <svg 
                      className="w-5 h-5 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                )}
              </div>
              
              {!lesson.completed && ( // ← исправлено
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}