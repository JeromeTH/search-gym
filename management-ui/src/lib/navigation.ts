import { useNavigate } from "react-router-dom";

export function useNavigateAfter<T>(
  action: (arg: T) => Promise<any>,
  path: string
): (arg: T) => void {
  const navigate = useNavigate();

  return (arg: T) => {
    action(arg)
      .then(() => navigate(path))
      .catch((err) => alert(err.message));
  };
}
