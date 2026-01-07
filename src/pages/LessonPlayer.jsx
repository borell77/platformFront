import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LessonPlayer() {
  const { groupId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [blockFeedback, setBlockFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загрузка урока
 useEffect(() => {
  const fetchLesson = async () => {
    try {
      setLoading(true);
      // ИСПРАВЛЕНО: запрашиваем только один урок с прогрессом
      const res = await api.get(`/lessons/${lessonId}/with-progress`);
      setLesson(res.data); // ← приходит один урок, не нужно искать
    } catch (err) {
      console.error('Ошибка загрузки урока:', err);
      setError('Не удалось загрузить урок');
    } finally {
      setLoading(false);
    }
  };
  fetchLesson();
}, [lessonId]);

  const currentBlock = lesson?.blocks?.[currentBlockIndex];

  // Обработка ответа
  const handleAnswerChange = (answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentBlockIndex]: answer
    }));
    // Сбрасываем фидбэк при изменении ответа
    if (blockFeedback[currentBlockIndex]) {
      setBlockFeedback(prev => ({ ...prev, [currentBlockIndex]: null }));
    }
  };

  // Отправка задания
  const handleSubmitTask = async () => {
    if (!currentBlock || currentBlock.type !== 'TASK') return;
    
    const answer = userAnswers[currentBlockIndex];
    if (!answer?.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/attempts', {
        taskId: parseInt(currentBlock.content),
        userAnswer: answer
      });
      
      // Сохраняем фидбэк от ИИ
      setBlockFeedback(prev => ({
        ...prev,
        [currentBlockIndex]: res.data.aiFeedback || 'Ответ принят'
      }));
    } catch (err) {
      console.error('Ошибка отправки:', err);
      setBlockFeedback(prev => ({
        ...prev,
        [currentBlockIndex]: 'Ошибка при проверке. Попробуйте позже.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Переход к следующему блоку
  const handleNext = () => {
    if (currentBlockIndex < (lesson?.blocks?.length - 1)) {
      setCurrentBlockIndex(currentBlockIndex + 1);
    } else {
      // Урок завершён — сохраняем факт завершения
      completeLesson();
    }
  };

  // Завершение урока
  const completeLesson = async () => {
  try {
    await api.post(`/lessons/${lessonId}/complete`);
    alert('✅ Урок завершён!');
    // Добавляем параметр refresh, чтобы GroupPage перезагрузил данные
    navigate(`/groups/${groupId}?refresh=1`);
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Не удалось завершить урок');
  }
};

  const handlePrev = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
    }
  };

  // Рендер блока
  const renderBlockContent = () => {
    if (!currentBlock) return null;

    switch (currentBlock.type) {
      case 'THEORY':
        return (
          <div 
            className="prose max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ 
              __html: currentBlock.content
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **жирный**
            }}
          />
        );

      case 'TASK':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Решите задание:</h3>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                {/* В идеале: загружать текст задания по ID, но для MVP — пока ID */}
                <div className="text-gray-700">
                  Задание #{currentBlock.content}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваш ответ:
              </label>
              <input
                type="text"
                value={userAnswers[currentBlockIndex] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите ответ"
                disabled={!!blockFeedback[currentBlockIndex]}
              />
            </div>

            {blockFeedback[currentBlockIndex] && (
              <div className={`p-3 rounded-lg ${
                blockFeedback[currentBlockIndex]?.includes('Верно') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {blockFeedback[currentBlockIndex]}
              </div>
            )}

            {!blockFeedback[currentBlockIndex] && (
              <button
                onClick={handleSubmitTask}
                disabled={!userAnswers[currentBlockIndex]?.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Проверка...' : 'Проверить'}
              </button>
            )}
          </div>
        );

      case 'TASK_GROUP':
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🧩</div>
            <h3 className="text-xl font-bold mb-3">Потренируйтесь!</h3>
            <p className="text-gray-600 mb-6">
              Пройдите серию заданий по теме, чтобы закрепить материал.
            </p>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-medium"
            >
              Начать тренировку
            </button>
            <p className="text-sm text-gray-500 mt-3">
              После тренировки вы вернётесь к уроку
            </p>
          </div>
        );

      case 'CHECK':
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">
              {currentBlock.content || 'Отличная работа!'}
            </h3>
            <p className="text-gray-600">
              Вы прошли все блоки этого урока.
            </p>
          </div>
        );

      default:
        return <div>Неизвестный тип блока</div>;
    }
  };

  // Загрузка
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Загрузка урока...
        </div>
      </div>
    );
  }

  // Ошибка
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-center p-6">
          <div className="text-2xl mb-2">⚠️</div>
          {error}
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Вернуться к группе
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Шапка */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/groups/${groupId}`)} 
              className="text-gray-600 hover:text-gray-900"
            >
              ← Назад
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{lesson?.title}</h1>
              <p className="text-sm text-gray-500">
                Блок {currentBlockIndex + 1} из {lesson?.blocks?.length}
              </p>
            </div>
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" 
              style={{ width: `${((currentBlockIndex + 1) / lesson.blocks.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          {renderBlockContent()}
        </div>

        {/* Кнопки навигации */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentBlockIndex === 0}
            className={`px-5 py-2.5 rounded-xl ${
              currentBlockIndex === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            Назад
          </button>
          <button
            onClick={handleNext}
            disabled={
              (currentBlock?.type === 'TASK' && !blockFeedback[currentBlockIndex]) ||
              (currentBlock?.type === 'TASK' && isSubmitting)
            }
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
          >
            {currentBlockIndex === lesson?.blocks?.length - 1 ? 'Завершить урок' : 'Далее'}
          </button>
        </div>
      </main>
    </div>
  );
}