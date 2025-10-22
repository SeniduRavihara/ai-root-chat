"use client";

import { addMockData } from "../../firebase/api";
import { useAuth } from "../../hooks/useAuth";

const TestPage = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div>Please log in to access this page.</div>;
  }
  return (
    <div>
      <button onClick={() => addMockData(currentUser?.uid, "chat1")}>
        Add Mock Data
      </button>
    </div>
  );
};
export default TestPage;
