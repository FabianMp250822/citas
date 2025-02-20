"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const UsersDataTable = ({ data = [] }) => {
  return (
    <div className="h-[250px]">
      <ScrollArea className="h-full">
        <Table className="border border-default-200">
          <TableHeader>
            <TableRow className="border-b border-default-200">
              {/* Encabezado para la ciudad */}
              <TableHead className="text-sm h-10 font-medium text-default-800">
                Ciudad
              </TableHead>
              {/* Encabezado para la cantidad de pacientes */}
              <TableHead className="text-sm h-10 font-medium text-default-800 text-right">
                Pacientes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="border-b border-default-200">
                <TableCell className="text-xs text-default-600 py-2">
                  {item.city}
                </TableCell>
                <TableCell className="text-xs text-default-600 text-right pr-6 py-2">
                  {item.count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default UsersDataTable;
