'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import type { Resource } from '@/lib/types';

const resourceSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  vamid: z.string().min(1, { message: 'VAMID is required.' }),
  grade: z.string().min(1, { message: 'Grade is required.' }),
  primarySkill: z.string().min(1, { message: 'Primary Skill is required.' }),
  currentSkill: z.string().min(1, { message: 'Current Skill is required.' }),
  joiningDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format.',
  }),
  totalExp: z.coerce.number().optional(),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: Resource | null;
}

export default function ResourceFormModal({
  isOpen,
  onClose,
  resource,
}: ResourceFormModalProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: '',
      vamid: '',
      grade: '',
      primarySkill: '',
      currentSkill: '',
      joiningDate: '',
      totalExp: 0,
    },
  });

  useEffect(() => {
    if (resource) {
      form.reset({
        ...resource,
        totalExp: resource.totalExp || 0,
      });
    } else {
      form.reset({
        name: '',
        vamid: '',
        grade: '',
        primarySkill: '',
        currentSkill: '',
        joiningDate: new Date().toISOString().split('T')[0],
        totalExp: 0,
      });
    }
  }, [resource, form]);

  const onSubmit = (data: ResourceFormValues) => {
    if (!firestore) return;

    if (resource?.id) {
      // Update existing resource
      const resourceRef = doc(firestore, 'resources', resource.id);
      updateDocumentNonBlocking(resourceRef, data);
      toast({ title: 'Resource Updated', description: `${data.name} has been updated.` });
    } else {
      // Create new resource
      const resourcesCollection = collection(firestore, 'resources');
      addDocumentNonBlocking(resourcesCollection, data);
      toast({ title: 'Resource Created', description: `${data.name} has been added.` });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{resource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
          <DialogDescription>
            {resource ? 'Update the details for this resource.' : 'Fill in the details for the new resource.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="vamid"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>VAMID</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. VAM12345" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. G7" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="joiningDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Joining Date</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="primarySkill"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Primary Skill</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. React" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="currentSkill"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Current Skill</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Node.js" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="totalExp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Experience (Years)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Resource</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
