import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ResolutionRateTable({ data }) {
  const departments = Object.keys(data);
  const months = Array.from(
    new Set(departments.flatMap(dept => Object.keys(data[dept])))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Departamento</TableHead>
          {months.map(month => (
            <TableHead key={month}>{month}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.map(department => (
          <TableRow key={department}>
            <TableCell>{department}</TableCell>
            {months.map(month => {
              const monthData = data[department][month];
              return (
                <TableCell key={`${department}-${month}`}>
                  {monthData ? `${(monthData.tasa_resolucion * 100).toFixed(1)}%` : '-'}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

