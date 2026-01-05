import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [formData, setFormData] = useState({
    loginOrEmail: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/signin', {
        loginOrEmail: formData.loginOrEmail,
        password: formData.password,
      });

      const { token, userId, username, firstName, lastName, email, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: userId,
        username,
        firstName,
        lastName,
        email,
        role,
      }));

      if (role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError('Неверный логин/email или пароль');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🧠</div>
          <h1 className="text-2xl font-bold text-gray-800">Подготовка к экзаменам</h1>
          <p className="text-gray-600 mt-1">Войдите в свой аккаунт</p>
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
            <div>
              <input
                type="text"
                name="loginOrEmail"
                placeholder="Логин или email"
                value={formData.loginOrEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
            >
              Войти
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Нет аккаунта?{' '}
            <a href="/register" className="text-blue-600 font-medium hover:text-blue-800 transition">
              Зарегистрироваться
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}