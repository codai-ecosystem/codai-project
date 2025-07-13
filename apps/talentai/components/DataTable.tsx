interface DataTableProps {
  data: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    label: string;
  }>;
  className?: string;
}

export default function DataTable({ data, columns, className = '' }: DataTableProps) {
  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/10">
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-3 text-left text-white font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-t border-white/10 hover:bg-white/5">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-3 text-gray-300">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
