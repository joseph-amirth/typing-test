import { NotificationsService } from "./notifications";
import { AccountServiceProvider } from "./account/Provider";
import { createService, useService } from ".";
import { ResultsServiceProvider } from "./results/Provider";
import PreferencesServiceProvider from "./preferences/Provider";

export const ServerService = createService<{
  fetchWithContext: <T>(
    path: string,
    options?: RequestInit,
  ) => Promise<ServerResponse<T>>;
  get: <T>(path: string, options?: RequestInit) => Promise<ServerResponse<T>>;
  post: <T>(
    path: string,
    data: object,
    options?: RequestInit,
  ) => Promise<ServerResponse<T>>;
}>({
  fetchWithContext: async () => {
    return { status: "fail" };
  },
  get: async () => {
    return { status: "fail" };
  },
  post: async () => {
    return { status: "fail" };
  },
});

export function ServerServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { addNotification } = useService(NotificationsService);

  async function fetchWithContext<T>(
    path: string,
    options?: RequestInit,
  ): Promise<ServerResponse<T>> {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (backendUrl === undefined || backendUrl.length === 0) {
      addNotification({
        type: "Error",
        title: "Backend disabled",
        body: "This client does not support fetching from the backend",
      });
      return { status: "fail" };
    }

    return fetch(backendUrl + path, options)
      .then(async (response): Promise<ServerResponse<T>> => {
        if (response.ok) {
          const body = (await response.json()) as T;
          return { status: "ok", body };
        } else if (response.status < 500) {
          const reason = await response.text();
          return { status: "err", reason };
        }
        throw new Error("Internal server error");
      })
      .catch((): ServerResponse<T> => {
        addNotification({
          type: "Error",
          title: "Unexpected error",
          body: "An unexpected error occurred while trying to communicate with the server",
        });
        return { status: "fail" };
      });
  }

  async function post<T>(path: string, obj: object, options?: RequestInit) {
    return fetchWithContext<T>(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
      ...options,
    });
  }

  async function get<T>(path: string, options?: RequestInit) {
    return fetchWithContext<T>(path, options);
  }

  const serverService = { fetchWithContext, get, post };

  return (
    <ServerService.Provider value={serverService}>
      <AccountServiceProvider>
        <PreferencesServiceProvider>
          <ResultsServiceProvider>{children}</ResultsServiceProvider>
        </PreferencesServiceProvider>
      </AccountServiceProvider>
    </ServerService.Provider>
  );
}

export type ServerResponse<T> = OkResponse<T> | ErrResponse | FailResponse;

// Success.
type OkResponse<T> = {
  status: "ok";
  body: T;
};

// Expected error.
type ErrResponse = {
  status: "err";
  reason: string;
};

// Unexpected error.
type FailResponse = {
  status: "fail";
};
