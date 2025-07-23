import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector} from "../../app/hooks";
import { login } from "../../features/userSlice";
import { toast, ToastContainer } from "react-toastify";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.user.error)

  const [userProfile, setUserProfile] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [password, setPass] = useState("");

  // const issuers = useAppSelector((state) => state.user.issuers);
  // const investors = useAppSelector((state) => state.user.investors);

  useEffect(() => {
    document.title = "Sign In";
  }, []);

  useEffect(() =>{
    if (user && error === null) {
      if (userProfile === 'investor'){
        navigate('/investor-dash', {state: {user}})
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log(userProfile);
    let  message, user = undefined
    if (userProfile === 'investor') {
      ({message, user} = await dispatch(login({profile:userProfile, email, password})).unwrap())
    } else if (userProfile === 'admin') {
      if (email === 'admin' && password === '123456') {
        navigate('/admin-dash')
      } else {
        message = 'Invalid credentials'
      }
    }

    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    if (message === "Login exitoso") setUser(user);
    console.log(user);
  };

  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="solar-panel-section mt-3">
        <form className="container row mt-4" style={{ textAlign: "left" }}>
          <h2 className="mb-4" style={{ textAlign: "center", color: "var(--color-green-main)" }}>SIGN IN</h2>
          <div className="col-sm mb-3 d-flex justify-content-space-beetwen ">
            <label className="form-label">User Profile:</label>
            <div className="form-check pr-4" style={{ marginRight: "20px", marginLeft: "20px" }}>
              <input
                type="radio"
                id="investor"
                name="userProfile"
                value="investor"
                className="form-check-input"
                checked={userProfile === "investor"}
                onChange={(e) => setUserProfile(e.target.value)}
              />
              <label className="form-check-label" htmlFor="investor">
                Investor
              </label>
            </div>
            <div className="form-check mr-4" style={{ marginRight: "20px", marginLeft: "20px" }}>
              <input
                type="radio"
                id="admin"
                name="userProfile"
                value="admin"
                className="form-check-input"
                checked={userProfile === "admin"}
                onChange={(e) => setUserProfile(e.target.value)}
              />
              <label className="form-check-label" htmlFor="admin">
                Admin
              </label>
            </div>
          </div>
          <div className="col-sm-12 mb-3">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control bg-form"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="col-sm-12 mb-3">
            <label htmlFor="password" className="form-label">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control bg-form"
              placeholder="Password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-end gap-3"><p>You don't have an account? </p> <Link to={'/user-registration'}>Sign up</Link></div>

          <div className="container-md row m-3" style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <button
              type="submit"
              className="btn btn-pay-now col-sm-4"
              style={{ alignItems: "right" }}
              onClick={handleSubmit}>
              Confirm
            </button>
            <button
              type="button"
              className="btn btn-back col-sm-2"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignIn;
