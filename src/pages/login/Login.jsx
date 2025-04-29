import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import './../../style/Style.css';
import { adminLogin } from '../../store/auth/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth); // Get loading and error from Redux state

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required'),
    }),
    onSubmit: (values) => {
      dispatch(adminLogin(values))
        .unwrap()
        .then(() => {
          navigate('/');
        })
        .catch((err) => {
          console.error(err);
        });
    },
  });

  return (
    <div className="signup-container">
      <div className="upper-section"></div>
      <div className="w-100 d-flex justify-content-center" style={{ position: 'absolute' }}>
        <div className="card signup-card">
          <div className="text-center">
            {/* Placeholder for Logo */}
            {/* <img src="/path-to-logo.png" alt="Logo" className="logo-img img-fluid" /> */}
          </div>
          <h3 className="text-center" style={{ overflow: 'hidden' }}>Login</h3>

          {/* Login Form */}
          <form onSubmit={formik.handleSubmit}>
            {/* Email Field */}
            <div className="mb-2">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i> {/* Bootstrap email icon */}
                </span>
                <input
                  id="email"
                  name="email"
                  type="text"
                  className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="invalid-feedback d-block">{formik.errors.email}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i> {/* Bootstrap lock icon */}
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="invalid-feedback d-block">{formik.errors.password}</div>
              )}
            </div>

            {/* Error Message */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Submit Button */}
            <div className="text-center mt-3">
              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="below-section"></div>
    </div>
  );
};

export default Login;
