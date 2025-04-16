import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import api from "@/lib/api";

// Type for context values
interface BackendContextType {
  timeDelta: number | undefined;
  loading: boolean;
  // error: string | null;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);


interface BackendProviderProps {
  children: ReactNode;
}

export const BackendProvider: React.FC<BackendProviderProps> = ({ children }) => {
  const [timeDelta, setTimeDelta] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBackendTime = async () => {
      try {
        const res = await api.get(`/server_time`);
        const { datetime } = res.data;
        const backendDate = new Date(datetime);
        const clientDate = new Date();
        const delta = clientDate.getTime() - backendDate.getTime();
        console.log("Backend time delta:", delta);
        setTimeDelta(delta);
      } catch (e) {
        console.error("Error fetching time:", e);
        alert("Error fetching time");
      } finally {
        setLoading(false);
      }
    };

    fetchBackendTime();
  }, []);

  return (
    <BackendContext.Provider value={{ timeDelta, loading }}>
      {children}
    </BackendContext.Provider>
  );
};


export const useBackend = (): BackendContextType => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error("useTime must be used within a BackendProvider");
  }
  return context;
};


