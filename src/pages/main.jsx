import React from "react";

export default function MainPage() {
  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Main</h1>
      <p className="text-purple-200">Central hub for game activities.</p>
    </section>
  );
}
import { Navigate } from "react-router-dom";

const qc = new QueryClient();

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/reflections", element: <Reflections /> },
  { path: "/reflections/new", element: <NewReflection /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);