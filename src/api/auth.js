const setAuth = token => {
  localStorage.setItem('authToken', token);
};

const removeAuth = () => {
  localStorage.removeItem('authToken');
};

const isLogin = () => {
  return !!localStorage.getItem('authToken');
};

const login = ({ id, password }) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, token: `${id}${password}${~~(Math.random() * 10000)}` });
    }, 0);
  }).then(res => {
    if (res.success) {
      setAuth(res.token);
    }

    return res;
  });
};

const logout = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true });
    }, 0);
  }).then(res => {
    if (res.success) {
      removeAuth();
    }

    return res;
  });
};

export default {
  isLogin,
  login,
  logout,
};
