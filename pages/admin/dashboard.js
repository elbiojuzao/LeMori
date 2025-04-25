import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total de Homenagens</h2>
          <p className="text-xl text-gray-500 font-bold">150</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Novos Usuários (Últimos 7 dias)</h2>
          <p className="text-xl text-green-500 font-bold">25</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Cupons Ativos</h2>
          <p className="text-xl text-gray-500 font-bold">10</p>
        </div>
        {/* Adicione mais informações resumidas aqui */}
      </div>
    </AdminLayout>
  );
}