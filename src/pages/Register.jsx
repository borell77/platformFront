import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/auth/signup', formData);
      alert('✅ Регистрация успешна! Теперь войдите.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data || 'Не удалось зарегистрироваться. Проверьте данные.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📚</div>
          <h1 className="text-2xl font-bold text-gray-800">Создайте аккаунт</h1>
          <p className="text-gray-600 mt-1">Начните подготовку к экзаменам</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          {error && (
            <div className="mb-4 p-3 text-red-600 bg-red-50 rounded-lg text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="firstName"
              placeholder="Имя"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              name="lastName"
              placeholder="Фамилия"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              name="username"
              placeholder="Логин (уникальный)"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Пароль (мин. 6 символов)"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />

            {/* Выбор роли */}
            <div className="pt-2">
              <p className="mb-3 font-medium text-gray-800">Вы регистрируетесь как:</p>
              <div className="flex flex-wrap gap-3">
                <label className={`flex items-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  formData.role === 'STUDENT' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="STUDENT"
                    checked={formData.role === 'STUDENT'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>🎓 Ученик</span>
                </label>
                <label className={`flex items-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  formData.role === 'TEACHER' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="TEACHER"
                    checked={formData.role === 'TEACHER'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>👨‍🏫 Учитель</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
            >
              Зарегистрироваться
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <a href="/login" className="text-blue-600 font-medium hover:text-blue-800 transition">
              Войти
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}