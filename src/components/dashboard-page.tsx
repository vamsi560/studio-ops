'use client';
import { useState, useEffect, useMemo } from 'react';
import { differenceInDays, startOfMonth } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard-layout';
import Header from '@/components/dashboard/header';
import UploadModal from '@/components/dashboard/upload-modal';
import FindCandidateModal from '@/components/dashboard/find-candidate-modal';
import StatCard from '@/components/dashboard/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, useUser } from '@/firebase';
import type { Resource, BenchAgeingData } from '@/lib/types';
import BenchAgeing from './dashboard/bench-ageing';
import GradeDistributionChart from './dashboard/grade-distribution-chart';
import SkillDistributionChart from './dashboard/skill-distribution-chart';
import { Users, UserX, TrendingUp, Sparkles, UserCheck } from 'lucide-react';
import { initiateAnonymousSignIn, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFindCandidateModalOpen, setIsFindCandidateModalOpen] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setIsClient(true);
    if (auth && !isUserLoading && !user) {
        initiateAnonymousSignIn(auth);
    }
  }, [auth, isUserLoading, user]);

  const resourcesQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'resources') : null),
    [firestore, user]
  );
  const { data: resources, isLoading: isLoadingResources } = useCollection<Resource>(resourcesQuery);
  
  const handleNewResources = (newResourcesData: Partial<Resource>[]) => {
    if (!firestore) return;
    const resourcesCollection = collection(firestore, 'resources');
    
    newResourcesData.forEach(resource => {
      addDocumentNonBlocking(resourcesCollection, resource);
    });
  };
  
  const { benchAgeingData, highExperienceCount, newThisMonthCount, topSkill } = useMemo(() => {
    const today = new Date();
    const startOfThisMonth = startOfMonth(today);

    const data: BenchAgeingData = { '0-30': 0, '31-60': 0, '61-90': 0, more_than_90: 0 };
    let highExpCount = 0;
    let newCount = 0;
    const skills: Record<string, number> = {};

    (resources || []).forEach(resource => {
      const joiningDate = resource.joiningDate ? new Date(resource.joiningDate) : null;
      if (joiningDate) {
          const daysOnBench = differenceInDays(today, joiningDate);
          if (daysOnBench <= 30) data['0-30']++;
          else if (daysOnBench <= 60) data['31-60']++;
          else if (daysOnBench <= 90) data['61-90']++;
          else data.more_than_90++;

          if (joiningDate >= startOfThisMonth) {
              newCount++;
          }
      }

      if (resource.grade && ['G8', 'G9'].includes(resource.grade.toUpperCase())) {
          highExpCount++;
      }

      if (resource.primarySkill) {
        skills[resource.primarySkill] = (skills[resource.primarySkill] || 0) + 1;
      }
    });

    const topSkillName = Object.keys(skills).length > 0 ? Object.keys(skills).reduce((a, b) => skills[a] > skills[b] ? a : b) : 'N/A';

    return { 
      benchAgeingData: data, 
      highExperienceCount: highExpCount,
      newThisMonthCount: newCount,
      topSkill: topSkillName,
    };
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

  const isLoading = isUserLoading || (user && isLoadingResources);

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
        currentResourceIds={(resources || []).map(r => r.vamid).filter(Boolean)}
        onNewResources={handleNewResources}
      />
      <FindCandidateModal
        isOpen={isFindCandidateModalOpen}
        onClose={() => setIsFindCandidateModalOpen(false)}
      />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <StatCard 
            icon={Users} 
            title="Total Bench" 
            value={resources?.length || 0}
            onClick={() => router.push('/resources')}
            />
          <StatCard icon={UserX} title="On Bench > 90 Days" value={benchAgeingData.more_than_90} />
          <StatCard icon={UserCheck} title="High Experience (G8+)" value={highExperienceCount} />
          <StatCard icon={TrendingUp} title="New This Month" value={newThisMonthCount} />
          <StatCard icon={Sparkles} title="Top Skill" value={topSkill} />
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
