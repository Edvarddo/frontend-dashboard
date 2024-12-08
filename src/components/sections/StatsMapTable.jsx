import React from 'react';

const StatsTable = ({ data }) => {
  // Calculate totals for each category
  const categories = ['Asistencia Social', 'Mantención de Calles', 'Seguridad', 'Áreas verdes'];
  
  // Create summary data
  const summaryData = data.map(item => ({
    junta: item.Junta_Vecinal.nombre,
    asistenciaSocial: item['Asistencia Social'] || 0,
    mantencionCalles: item['Mantención de Calles'] || 0,
    seguridad: item['Seguridad'] || 0,
    areasVerdes: item['Áreas verdes'] || 0,
    total: item.Junta_Vecinal.total_publicaciones
  }));

  // Calculate totals
  const totals = summaryData.reduce((acc, curr) => ({
    asistenciaSocial: acc.asistenciaSocial + curr.asistenciaSocial,
    mantencionCalles: acc.mantencionCalles + curr.mantencionCalles,
    seguridad: acc.seguridad + curr.seguridad,
    areasVerdes: acc.areasVerdes + curr.areasVerdes,
    total: acc.total + curr.total
  }), {
    asistenciaSocial: 0,
    mantencionCalles: 0,
    seguridad: 0,
    areasVerdes: 0,
    total: 0
  });

  return (
    <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Estadísticas por Junta Vecinal y Categoría</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Junta Vecinal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia Social</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mantención de Calles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seguridad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Áreas Verdes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summaryData.map((row) => (
              <tr key={row.junta}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.junta}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.asistenciaSocial}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.mantencionCalles}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.seguridad}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.areasVerdes}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.total}</td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Total</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{totals.asistenciaSocial}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{totals.mantencionCalles}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{totals.seguridad}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{totals.areasVerdes}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{totals.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsTable;

