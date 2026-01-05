import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StudentDashboard() {
  const [groups, setGroups] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups/my-student');
      setGroups(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      console.error('Ошибка загрузки групп:', err);
      if (err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }
      setError('Не удалось загрузить группы.');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('Введите код приглашения');
      return;
    }

    try {
      setError('');
      await api.post('/groups/join', { inviteCode: inviteCode.trim() });
      alert('Вы присоединились к группе! 🎉');
      setInviteCode('');
      fetchGroups();
    } catch (err) {
      if (err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }
      setError(err.response?.data || 'Неверный код приглашения');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  // Предмет → иконка и цвет
  const subjectConfig = {
    math: { name: 'Математика', color: 'bg-blue-500', icon: '📐' },
    russian: { name: 'Русский язык', color: 'bg-red-500', icon: '📚' },
    physics: { name: 'Физика', color: 'bg-purple-500', icon: '⚛️' },
    chemistry: { name: 'Химия', color: 'bg-green-500', icon: '🧪' },
    biology: { name: 'Биология', color: 'bg-emerald-500', icon: '🌿' },
    history: { name: 'История', color: 'bg-amber-500', icon: '🏛️' },
    social: { name: 'Обществознание', color: 'bg-orange-500', icon: '👥' },
    informatics: { name: 'Информатика', color: 'bg-indigo-500', icon: '💻' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Шапка с прозрачным фоном */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Мои группы
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 transition"
          >
            <span>Выйти</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Карточка: присоединиться */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>+</span> Присоединиться к группе
          </h2>
          <form onSubmit={handleJoinGroup} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Введите код приглашения (например: MATH-48291)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Присоединиться
            </button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Заголовок списка */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Ваши группы <span className="text-gray-500">({groups.length})</span>
          </h2>
        </div>

        {/* Список групп */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-pulse text-gray-500">Загрузка ваших групп...</div>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-5xl mb-4">📓</div>
            <p className="text-gray-600 max-w-md mx-auto">
              У вас пока нет групп. Попросите учителя прислать код приглашения.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {groups.map(group => {
                const config = subjectConfig[group.subject] || { name: group.subject, color: 'bg-gray-500', icon: '📖' };
                return (
                    <div 
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-green-300 transition-all group cursor-pointer"
                    >
                    <div className="flex items-start gap-4">
                        <div className={`${config.color} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-sm`}>
                        {config.icon}
                        </div>
                        <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors">
                            {group.name}
                        </h3>
                        <div className="text-sm text-gray-700 mt-1">
                            Предмет: <span className="font-medium">{config.name}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            Учитель: {group.teacherName}
                        </div>
                        </div>
                    </div>
                    </div>
                );
                })}
          </div>
        )}
      </main>
    </div>
  );
}