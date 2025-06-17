export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold">Financial Tracker</h1>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}