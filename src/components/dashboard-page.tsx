'use client';
import { useState, useEffect, useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard-layout';
import Header from '@/components/dashboard/header';
import UploadModal from '@/components/dashboard/upload-modal';
import FindCandidateModal from '@/components/dashboard/find-candidate-modal';
import StatCard from '@/components/dashboard/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, useUser } from '@/firebase';
import type { Resource, BenchAgeingData } from '@/lib/types';
import BenchAgeing from './dashboard/bench-ageing';
import GradeDistributionChart from './dashboard/grade-distribution-chart';
import SkillDistributionChart from './dashboard/skill-distribution-chart';
import { Users, Briefcase, UserX, TrendingUp, Sparkles } from 'lucide-react';
import { initiateAnonymousSignIn, useAuth } from '@/firebase';
import { ALL_RESOURCES } from '@/lib/mock-data';


export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFindCandidateModalOpen, setIsFindCandidateModalOpen] = useState(false);
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const resourcesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'resources') : null),
    [firestore]
  );
  const { data: resources, isLoading: isLoadingResources } = useCollection<Resource>(resourcesQuery);
  
  useEffect(() => {
    setIsClient(true);
    if (!isUserLoading && !user && auth) {
        initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);
  
  const handleNewResources = (newResourcesData: Partial<Resource>[]) => {
    if (!firestore) return;
    const resourcesCollection = collection(firestore, 'resources');
    
    // Fallback to mock data if AI fails in UploadModal
    const dataToUpload = newResourcesData.length > 0 
      ? newResourcesData 
      : ALL_RESOURCES.filter(r => ['VAM1011', 'VAM1012', 'VAM1013', 'VAM1014', 'VAM1015'].includes(r.vamid));
      
    dataToUpload.forEach(resource => {
      // Here you would map the parsed Excel row to your Resource object
      // For now, assuming the objects in newResourcesData are already in the correct format
      addDocumentNonBlocking(resourcesCollection, resource);
    });
  };
  
  const benchAgeingData = useMemo((): BenchAgeingData => {
    const today = new Date();
    const data: BenchAgeingData = { '0-30': 0, '31-60': 0, '61-90': 0, more_than_90: 0 };
    (resources || []).forEach(resource => {
      if (!resource.joiningDate) return;
      const daysOnBench = differenceInDays(today, new Date(resource.joiningDate));
      if (daysOnBench <= 30) data['0-30']++;
      else if (daysOnBench <= 60) data['31-60']++;
      else if (daysOnBench <= 90) data['61-90']++;
      else data.more_than_90++;
    });
    return data;
  }, [resources]);

  const gradeDistribution = useMemo(() => {
    return (resources || [])
      .reduce((acc, resource) => {
        if (!resource.grade) return acc;
        const existing = acc.find(item => item.name === resource.grade);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: resource.grade, value: 1 });
        }
        return acc;
      }, [] as { name: string; value: number }[])
      .sort((a, b) => b.value - a.value);
  }, [resources]);

  const skillDistribution = useMemo(() => {
    return (resources || [])
      .reduce((acc, resource) => {
        const skill = resource.primarySkill;
        if (!skill) return acc;
        const existing = acc.find(item => item.name === skill);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: skill, value: 1 });
        }
        return acc;
      }, [] as { name: string; value: number }[])
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [resources]);

  const isLoading = isUserLoading || isLoadingResources;

  if (!isClient || isLoading) {
    return (
       <DashboardLayout>
        <Header onUploadClick={() => {}} onFindCandidateClick={() => {}} />
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Skeleton className="lg:col-span-3 h-80" />
              <Skeleton className="lg:col-span-4 h-80" />
          </div>
           <Skeleton className="h-96" />
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header 
        onUploadClick={() => setIsUploadModalOpen(true)}
        onFindCandidateClick={() => setIsFindCandidateModalOpen(true)}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentResourceIds={(resources || []).map(r => r.vamid)}
        onNewResources={handleNewResources}
      />
      <FindCandidateModal
        isOpen={isFindCandidateModalOpen}
        onClose={() => setIsFindCandidateModalOpen(false)}
      />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <StatCard icon={Users} title="Total Bench" value={resources?.length || 0} />
          <StatCard icon={Briefcase} title="Internal Fulfilment" value="8" description="+2 this month" />
          <StatCard icon={UserX} title="Client Rejections" value="3" />
          <StatCard icon={TrendingUp} title="Hiring Forecast" value="12" />
          <StatCard icon={Sparkles} title="Upskilling Forecast" value="6" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <BenchAgeing data={benchAgeingData} />
           <GradeDistributionChart data={gradeDistribution} />
        </div>
        <SkillDistributionChart data={skillDistribution} />
      </main>
    </DashboardLayout>
  );
}
