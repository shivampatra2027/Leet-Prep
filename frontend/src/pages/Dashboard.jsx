import Layout from "../components/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Welcome to LeetIO</h2>
      <p className="text-gray-700">Here you’ll see your subscription status, problem stats, and progress.</p>
    </Layout>
  );
}
