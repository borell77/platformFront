import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SUBJECTS = [
  { code: 'math', name: 'Математика' },
  { code: 'russian', name: 'Русский язык' },
  { code: 'physics', name: 'Физика' },
  { code: 'chemistry', name: 'Химия' },
  { code: 'biology', name: 'Биология' },
  { code: 'history', name: 'История' },
  { code: 'social', name: 'Обществознание' },
  { code: 'informatics', name: 'Информатика' },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    examType: 'EGE',
    examSubjects: ['math', 'russian'],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setUser(res.data);
        setEditData({
          examType: res.data.examType || 'EGE',
          examSubjects: res.data.examSubjects || ['math', 'russian'],
        });
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSave = async () => {
    try {
      await api.put('/auth/profile', editData);
      setUser({ ...user, ...editData });
      setIsEditing(false);
      alert('Настройки сохранены!');
    } catch (err) {
      alert('Ошибка при сохранении');
    }
  };

  const handleSubjectsChange = (subjectCode) => {
    const newSubjects = editData.examSubjects.includes(subjectCode)
      ? editData.examSubjects.filter(s => s !== subjectCode)
      : [...editData.examSubjects, subjectCode];
    setEditData({ ...editData, examSubjects: newSubjects });
  };

  if (!user) return <div className="p-6">Загрузка...</div>;

  const getExamTypeName = (type) => type === 'EGE' ? 'ЕГЭ (11 класс)' : 'ОГЭ (9 класс)';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Личный кабинет</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Выйти
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Инфо */}
          <div className="mb-6">
            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-600">@{user.username} • {user.email}</p>
          </div>

          {/* Тип экзамена и предметы */}
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Тип экзамена:</h3>
                <p>{getExamTypeName(user.examType)}</p>
              </div>
              <div>
                <h3 className="font-semibold">Предметы:</h3>
                <p>
                  {user.examSubjects?.map(code => 
                    SUBJECTS.find(s => s.code === code)?.name
                  ).join(', ') || 'Не выбраны'}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Изменить настройки
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Тип экзамена:</label>
                <div className="flex gap-4">
                  <label>
                    <input
                      type="radio"
                      name="examType"
                      value="EGE"
                      checked={editData.examType === 'EGE'}
                      onChange={(e) => setEditData({ ...editData, examType: e.target.value })}
                    /> ЕГЭ (11 класс)
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="examType"
                      value="OGE"
                      checked={editData.examType === 'OGE'}
                      onChange={(e) => setEditData({ ...editData, examType: e.target.value })}
                    /> ОГЭ (9 класс)
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold">Предметы:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUBJECTS.map(subject => (
                    <label key={subject.code} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editData.examSubjects.includes(subject.code)}
                        onChange={() => handleSubjectsChange(subject.code)}
                      /> {subject.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}