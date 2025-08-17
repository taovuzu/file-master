import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "@/redux/auth/actions";

const AuthCallback = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser()).finally(() => {
      window.location.replace("/home");
    });
  }, [dispatch]);

  return <p>Finishing login...</p>;
}

export default AuthCallback;