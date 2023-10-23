import React from 'react';
import './style.scss';
import makeToast from '../../shared/Toaster/index';
import validateCPF from '../../utils/validateCpf';
import api from '../../api';

export default function Login() {
  const emailLogin = React.createRef();
  const passwordLogin = React.createRef();
  const nameRegister = React.createRef();
  const cpfRegister = React.createRef();
  const phoneRegister = React.createRef();
  const emailRegister = React.createRef();
  const passwordRegister = React.createRef();
  const passwordConfirmationRegister = React.createRef();

  const handleSignIn = () => {
    if (!emailLogin.current.value || !passwordLogin.current.value) {
      makeToast('error', 'Fill in all the fields!');
      return;
    }

    api
      .post('/auth/sign-in', {
        email: emailLogin.current.value,
        password: passwordLogin.current.value,
      })
      .then((response) => {
        makeToast('success', 'Logged in successfully!');
        localStorage.setItem('CC_Access_Token', response.data.accessToken);
        localStorage.setItem('CC_Refresh_Token', response.data.refreshToken);
      })
      .catch((error) => {
        if (error.response.data.message && typeof error.response.data.message === 'object') {
          makeToast(
            'error',
            `${error.response.data.message[0].path[0]} : ${error.response.data.message[0].message}`
          );
        } else if (error.response.data.message && typeof error.response.data.message === 'string') {
          makeToast('error', error.response.data.message);
        } else {
          makeToast('error', 'Error while registering user!');
        }
      });
  };

  const handleSignUp = () => {
    if (
      !nameRegister.current.value ||
      !cpfRegister.current.value ||
      !phoneRegister.current.value ||
      !emailRegister.current.value ||
      !passwordRegister.current.value ||
      !passwordConfirmationRegister.current.value
    ) {
      makeToast('error', 'Fill in all the fields!');
      return;
    }

    if (passwordRegister.current.value !== passwordConfirmationRegister.current.value) {
      makeToast('error', 'Passwords do not match!');
      return;
    }

    if (!validateCPF(cpfRegister.current.value)) {
      makeToast('error', 'Invalid CPF!');
      return;
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/g.test(
        passwordRegister.current.value
      )
    ) {
      makeToast(
        'error',
        'Password must have minimum 6 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character!'
      );
      return;
    }

    api
      .post('/auth/sign-up', {
        name: nameRegister.current.value,
        cpf: cpfRegister.current.value,
        phone: phoneRegister.current.value,
        email: emailRegister.current.value,
        password: passwordRegister.current.value,
        passwordConfirmation: passwordConfirmationRegister.current.value,
      })
      .then(() => {
        makeToast('success', 'Signed up successfully!');
        emailLogin.current.value = emailRegister.current.value;
        passwordLogin.current.value = passwordRegister.current.value;
        handleSignIn();
      })
      .catch((error) => {
        if (error.response.data.message && typeof error.response.data.message === 'object') {
          makeToast(
            'error',
            `${error.response.data.message[0].path[0]} : ${error.response.data.message[0].message}`
          );
        } else if (error.response.data.message && typeof error.response.data.message === 'string') {
          makeToast('error', error.response.data.message);
        } else {
          makeToast('error', 'Error while registering user!');
        }
      });
  };

  const formatCPF = () => {
    const cpf = cpfRegister.current.value;

    cpfRegister.current.value = cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1-$2');

    if (cpfRegister.current.value.length >= 14) {
      cpfRegister.current.value = cpfRegister.current.value.substring(0, 14);
    }
  };

  const formatPhone = () => {
    const phone = phoneRegister.current.value;

    phoneRegister.current.value = phone
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1 $2')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');

    if (phoneRegister.current.value.length >= 18) {
      phoneRegister.current.value = phoneRegister.current.value.substring(0, 18);
    }
  };

  return (
    <>
      <main>
        <div className='login-container'>
          <div className='login-modal'>
            <div className='login-columns'>
              <div className='login-column'>
                <h2 className='login-title'>Login</h2>
                <div className='login-field'>
                  <label className='login-label' htmlFor='emailLogin'>
                    <p className='login-paragraph'>E-mail:</p>
                    <input
                      className='login-input'
                      type='email'
                      id='emailLogin'
                      placeholder='email@example.com'
                      ref={emailLogin}
                    />
                  </label>
                  <label className='login-label' htmlFor='passwordLogin'>
                    <p className='login-paragraph'>Password:</p>
                    <input
                      className='login-input'
                      type='password'
                      id='passwordLogin'
                      placeholder='******'
                      ref={passwordLogin}
                    />
                  </label>
                </div>
                <button className='login-button' type='submit' onClick={handleSignIn}>
                  Login
                </button>
              </div>
              <div className='login-column'>
                <h2 className='login-title'>Register</h2>
                <div className='login-field'>
                  <label className='login-label' htmlFor='name'>
                    <p className='login-paragraph'>Name:</p>
                    <input
                      className='login-input'
                      type='text'
                      id='name'
                      placeholder='John Doe'
                      ref={nameRegister}
                    />
                  </label>
                  <label className='login-label' htmlFor='phone'>
                    <p className='login-paragraph'>Phone:</p>
                    <input
                      className='login-input'
                      type='text'
                      id='phone'
                      placeholder='55 (11) 92203-1029'
                      onChange={formatPhone}
                      ref={phoneRegister}
                    />
                  </label>
                  <label className='login-label' htmlFor='cpf'>
                    <p className='login-paragraph'>CPF:</p>
                    <input
                      className='login-input'
                      type='text'
                      id='cpf'
                      placeholder='111.222.333-44'
                      onChange={formatCPF}
                      ref={cpfRegister}
                    />
                  </label>
                  <label className='login-label' htmlFor='emailRegister'>
                    <p className='login-paragraph'>E-mail:</p>
                    <input
                      className='login-input'
                      type='email'
                      id='emailRegister'
                      placeholder='email@example.com'
                      ref={emailRegister}
                    />
                  </label>
                  <label className='login-label' htmlFor='passwordRegister'>
                    <p className='login-paragraph'>Password:</p>
                    <input
                      className='login-input'
                      type='password'
                      id='passwordRegister'
                      placeholder='******'
                      ref={passwordRegister}
                    />
                  </label>
                  <label className='login-label' htmlFor='passwordConfirmation'>
                    <p className='login-paragraph'>Password confirmation:</p>
                    <input
                      className='login-input'
                      type='password'
                      id='passwordConfirmation'
                      placeholder='******'
                      ref={passwordConfirmationRegister}
                    />
                  </label>
                </div>
                <button className='login-button' type='submit' onClick={handleSignUp}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
