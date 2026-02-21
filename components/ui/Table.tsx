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
            variant="outlined"
            sx={{
                borderRadius: '1rem',
                overflow: 'hidden',
                borderColor: '#f1f5f9',
                boxShadow: 'none'
            }}
        >
            <MuiTable sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableCell
                                key={index}
                                sx={{
                                    fontWeight: 700,
                                    color: 'text.secondary',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    py: 2
                                }}
                            >
                                {column.header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} align="center" sx={{ py: 10 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress size={24} />
                                    <Typography variant="body2" color="text.secondary">
                                        Cargando datos...
                                    </Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} align="center" sx={{ py: 10 }}>
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                    {emptyMessage}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item, rowIndex) => (
                            <TableRow
                                key={rowIndex}
                                onClick={() => onRowClick && onRowClick(item)}
                                sx={{
                                    cursor: onRowClick ? 'pointer' : 'default',
                                    '&:hover': { bgcolor: '#f8fafc' },
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                {columns.map((column, colIndex) => (
                                    <TableCell key={colIndex} sx={{ py: 2 }}>
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
