import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LessonEditor() {
  const { groupId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [lessonTitle, setLessonTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загружаем урок и задания
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем урок
        const lessonRes = await api.get(`/lessons/${lessonId}`);
        const lesson = lessonRes.data;
        setLessonTitle(lesson.title);
        setBlocks(lesson.blocks.map((block, index) => ({
          ...block,
          id: index // временный ID для редактирования
        })));

        // Загружаем задания
        const tasksRes = await api.get('/tasks?subject=math');
        setAvailableTasks(tasksRes.data);
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError('Не удалось загрузить урок');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lessonId]);

  const addBlock = (type) => {
    const newBlock = { 
      type, 
      content: type === 'TASK' ? availableTasks[0]?.id?.toString() || '' : '',
      id: Date.now() // уникальный ID для нового блока
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (index, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[index][field] = value;
    setBlocks(newBlocks);
  };

  const removeBlock = (index) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const otherIndex = direction === 'up' ? index - 1 : index + 1;
    if (otherIndex < 0 || otherIndex >= newBlocks.length) return;
    
    [newBlocks[index], newBlocks[otherIndex]] = [newBlocks[otherIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim() || blocks.length === 0) {
      setError('Укажите название урока и добавьте хотя бы один блок');
      return;
    }

    try {
      setLoading(true);
      // PUT-запрос на обновление урока
      await api.put(`/lessons/${lessonId}`, {
        title: lessonTitle,
        blocks: blocks.map(block => ({
          type: block.type,
          content: block.content
        }))
      });
      alert('✅ Урок успешно обновлён!');
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error('Ошибка:', err);
      setError('Не удалось сохранить урок. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Загрузка урока...</div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-center p-6">
          <div className="text-2xl mb-2">⚠️</div>
          {error}
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="text-gray-600 hover:text-gray-900"
          >
            ← Назад
          </button>
          <h1 className="text-xl font-bold">Редактировать урок</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Название урока */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Название урока
            </label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Например: Урок 1 — Логарифмы"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Блоки */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Блоки урока</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => addBlock('THEORY')}
                  className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                >
                  + Теория
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('TASK')}
                  className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                >
                  + Задание
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('TASK_GROUP')}
                  className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition"
                >
                  + Группа заданий
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('CHECK')}
                  className="px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition"
                >
                  + Проверка
                </button>
              </div>
            </div>

            {blocks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-600">Нет блоков. Добавьте первый блок.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <BlockEditor
                    key={block.id || index}
                    block={block}
                    index={index}
                    availableTasks={availableTasks}
                    onUpdate={updateBlock}
                    onRemove={() => removeBlock(index)}
                    onMoveUp={() => moveBlock(index, 'up')}
                    onMoveDown={() => moveBlock(index, 'down')}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Ошибки и кнопки */}
          {error && (
            <div className="p-3 text-red-600 bg-red-50 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md disabled:opacity-70"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// Компонент редактирования одного блока (тот же, что и в конструкторе)
function BlockEditor({ 
  block, 
  index, 
  availableTasks, 
  onUpdate, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  isFirst,
  isLast
}) {
  const blockTypeLabels = {
    THEORY: '📖 Теория',
    TASK: '✏️ Задание',
    TASK_GROUP: '🧩 Группа заданий',
    CHECK: '📊 Проверка'
  };

  const blockColors = {
    THEORY: 'border-blue-200 bg-blue-50',
    TASK: 'border-green-200 bg-green-50',
    TASK_GROUP: 'border-purple-200 bg-purple-50',
    CHECK: 'border-amber-200 bg-amber-50'
  };

  return (
    <div className={`bg-white rounded-xl border p-5 ${blockColors[block.type]}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="font-bold text-gray-800">{blockTypeLabels[block.type]}</span>
          <span className="ml-2 text-xs text-gray-500">#{index + 1}</span>
        </div>
        <div className="flex gap-1">
          {!isFirst && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Вверх"
            >
              ↑
            </button>
          )}
          {!isLast && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Вниз"
            >
              ↓
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-500 hover:text-red-700"
            title="Удалить"
          >
            ✕
          </button>
        </div>
      </div>

      {block.type === 'THEORY' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Текст теории</label>
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(index, 'content', e.target.value)}
            placeholder="Введите пояснение, формулы, примеры..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows="4"
          />
          <p className="text-xs text-gray-500 mt-1">Поддерживается обычный текст. Для формул используйте запись: log₂(x-1)</p>
        </div>
      )}

      {block.type === 'TASK' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Выберите задание</label>
          <select
            value={block.content}
            onChange={(e) => onUpdate(index, 'content', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">-- Выберите задание --</option>
            {availableTasks.map(task => (
              <option key={task.id} value={task.id}>
                №{task.taskNumber}: {task.text.substring(0, 50)}...
              </option>
            ))}
          </select>
        </div>
      )}

      {block.type === 'TASK_GROUP' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тема</label>
            <select
              value={JSON.parse(block.content || '{}').topicId || ''}
              onChange={(e) => {
                const newContent = JSON.stringify({
                  topicId: e.target.value || null,
                  count: JSON.parse(block.content || '{}').count || 5
                });
                onUpdate(index, 'content', newContent);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">-- Выберите тему --</option>
              <option value="1">Тригонометрия</option>
              <option value="2">Логарифмы</option>
              <option value="3">Показательные уравнения</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Количество заданий</label>
            <input
              type="number"
              min="1"
              max="20"
              value={JSON.parse(block.content || '{}').count || 5}
              onChange={(e) => {
                const newContent = JSON.stringify({
                  topicId: JSON.parse(block.content || '{}').topicId,
                  count: e.target.value
                });
                onUpdate(index, 'content', newContent);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {block.type === 'CHECK' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Сообщение после прохождения</label>
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(index, 'content', e.target.value)}
            placeholder="Например: Отлично! Вы готовы к следующей теме."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            rows="2"
          />
        </div>
      )}
    </div>
  );
}