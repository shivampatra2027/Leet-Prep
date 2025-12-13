export default function Card({ title, children }) {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}
