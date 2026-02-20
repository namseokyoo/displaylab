/**
 * DataTable Component
 *
 * Generic data table with sortable columns.
 */

interface Column<T> {
  key: keyof T;
  label: string;
  format?: (value: unknown) => string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  maxRows?: number;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  maxRows = 100,
}: DataTableProps<T>) {
  const displayData = data.slice(0, maxRows);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">No data to display</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {displayData.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {col.format
                    ? col.format(row[col.key])
                    : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > maxRows && (
        <div className="text-center py-2 text-xs text-gray-400 dark:text-gray-500">
          Showing {maxRows} of {data.length} rows
        </div>
      )}
    </div>
  );
}
