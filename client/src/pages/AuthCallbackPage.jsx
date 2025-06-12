import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "@/redux/auth/actions";

const AuthCallback = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser()).finally(() => {
      try {
        const stored = window.localStorage.getItem("postLoginRedirect");
        if (stored) {
          window.localStorage.removeItem("postLoginRedirect");
          window.location.replace(stored);
          return;
        }
      } catch (_) {}
      window.location.replace("/home");
    });
  }, [dispatch]);

  return <p>Finishing login...</p>;
};

export default AuthCallback;