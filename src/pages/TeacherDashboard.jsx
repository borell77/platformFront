import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TeacherDashboard() {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: '', subject: 'math' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/groups/my');
      setGroups(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', newGroup);
      fetchGroups();
      setNewGroup({ name: '', subject: 'math' });
    } catch (err) {
      alert('Ошибка при создании группы');
    }
  };

  const handleCreateLesson = (groupId) => {
    navigate(`/groups/${groupId}/lessons/new`);
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

  const SUBJECTS = Object.entries(subjectConfig).map(([code, config]) => ({
    code,
    name: config.name
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Шапка */}
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
        {/* Карточка: создать группу */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>+</span> Создать новую группу
          </h2>
          <form onSubmit={handleCreateGroup} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              placeholder="Название группы"
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <select
              value={newGroup.subject}
              onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SUBJECTS.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Создать
            </button>
          </form>
        </div>

        {/* Список групп */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Ваши группы <span className="text-gray-500">({groups.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-pulse text-gray-500">Загрузка групп...</div>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-5xl mb-4">🎓</div>
            <p className="text-gray-600 max-w-md mx-auto">
              У вас пока нет групп. Создайте первую, чтобы приглашать учеников.
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
                    className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 transition-all group cursor-pointer"
                    >
                    <div className="flex items-start gap-4">
                        <div className={`${config.color} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-sm`}>
                        {config.icon}
                        </div>
                        <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                            {group.name}
                        </h3>
                        <div className="mt-2">
                            <div className="text-sm text-gray-600">
                            Предмет: <span className="font-medium">{config.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                            Код: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{group.inviteCode}</span>
                            </div>
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