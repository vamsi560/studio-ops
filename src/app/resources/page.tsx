'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCollection, useFirestore, useMemoFirebase, useUser, useAuth, initiateAnonymousSignIn } from '@/firebase';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Resource } from '@/lib/types';
import ResourceFormModal from '@/components/resources/resource-form-modal';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResourcesPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (auth && !isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, isUserLoading, user]);

  const resourcesQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'resources') : null),
    [firestore, user]
  );
  const { data: resources, isLoading: isLoadingResources } = useCollection<Resource>(resourcesQuery);

  const isLoading = isUserLoading || (user && isLoadingResources);

  const handleDelete = () => {
    if (!firestore || !selectedResource?.id) return;
    const resourceRef = doc(firestore, 'resources', selectedResource.id);
    deleteDocumentNonBlocking(resourceRef);
    toast({ title: 'Resource deleted', description: `${selectedResource.name} has been removed.` });
    setIsDeleteDialogOpen(false);
    setSelectedResource(null);
  };

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDeleteDialogOpen(true);
  };
  
  const handleOpenCreateModal = () => {
    setSelectedResource(null);
    setIsModalOpen(true);
  }

  const columns: ColumnDef<Resource>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'vamid',
        header: 'VAMID',
      },
      {
        accessorKey: 'grade',
        header: 'Grade',
      },
      {
        accessorKey: 'primarySkill',
        header: 'Primary Skill',
      },
      {
        accessorKey: 'joiningDate',
        header: 'Joining Date',
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const resource = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(resource)}>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={() => handleOpenDeleteDialog(resource)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [firestore]
  );

  const table = useReactTable({
    data: resources || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={columns.length}>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          ))}
        </>
      );
    }
    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && 'selected'}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )}
            </TableCell>
          ))}
        </TableRow>
      ));
    }
    return (
      <TableRow>
        <TableCell
          colSpan={columns.length}
          className="h-24 text-center"
        >
          No results.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <DashboardLayout>
      <header className="bg-card border-b p-4 sm:p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Manage Resources</h2>
        <Button onClick={handleOpenCreateModal}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Resource
        </Button>
      </header>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter by name..."
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('name')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {renderTableBody()}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </main>

      {isModalOpen && (
         <ResourceFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            resource={selectedResource}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              resource for {selectedResource?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
