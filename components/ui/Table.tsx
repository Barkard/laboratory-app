'use client';

import React from 'react';
import {
    Table as MuiTable,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    CircularProgress,
    Typography
} from '@mui/material';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

const Table = <T extends { [key: string]: any }>({
    data,
    columns,
    onRowClick,
    isLoading = false,
    emptyMessage = "No se encontraron datos.",
}: TableProps<T>) => {
    return (
        <TableContainer
            component={Paper}
            elevation={0}
            className="rounded-2xl overflow-hidden shadow-none"
        >
            <MuiTable sx={{ minWidth: 650 }}>
                <TableHead className="bg-white/5">
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableCell
                                key={index}
                                sx={{
                                    fontWeight: 700,
                                    color: 'slate-400',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    py: 2.5,
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                }}
                                className="text-slate-400"
                            >
                                {column.header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} align="center" sx={{ py: 10, border: 0 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress size={24} sx={{ color: '#38bdf8' }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        Cargando datos...
                                    </Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} align="center" sx={{ py: 10, border: 0 }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                                    {emptyMessage}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item, rowIndex) => (
                            <TableRow
                                key={rowIndex}
                                onClick={() => onRowClick && onRowClick(item)}
                                className={`
                                    transition-all duration-300
                                    ${onRowClick ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}
                                `}
                                sx={{
                                    '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.03)' },
                                    '&:last-child td': { borderBottom: 0 }
                                }}
                            >
                                {columns.map((column, colIndex) => (
                                    <TableCell
                                        key={colIndex}
                                        sx={{ py: 2, color: 'white' }}
                                    >
                                        {typeof column.accessor === 'function'
                                            ? column.accessor(item)
                                            : item[column.accessor as string]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </MuiTable>
        </TableContainer>
    );
};

export default Table;
