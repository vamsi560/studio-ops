'use client';
import { useState, useEffect, useMemo } from 'react';
import { differenceInDays, startOfMonth } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard-layout';
import Header from '@/components/dashboard/header';
import UploadModal from '@/components/dashboard/upload-modal';
import FindCandidateModal from '@/components/dashboard/find-candidate-modal';
import StatCard from '@/components/dashboard/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Resource, BenchAgeingData } from '@/lib/types';
import BenchAgeing from './dashboard/bench-ageing';
import GradeDistributionChart from './dashboard/grade-distribution-chart';
import SkillDistributionChart from './dashboard/skill-distribution-chart';
import { Users, UserX, TrendingUp, Sparkles, UserCheck, AlertCircle } from 'lucide-react';
import { useResources } from '@/lib/db/hooks/use-resources';
import { addResources } from '@/app/actions/resources';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFindCandidateModalOpen, setIsFindCandidateModalOpen] = useState(false);
  
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: resources, isLoading: isLoadingResources, error: resourcesError, refetch } = useResources();
  
  // Debug logging
  useEffect(() => {
    console.log('Dashboard state:', {
      isClient,
      resourcesCount: resources?.length || 0,
      isLoadingResources,
      error: resourcesError?.message,
    });
  }, [isClient, resources, isLoadingResources, resourcesError]);
  
  // Log errors
  useEffect(() => {
    if (resourcesError) {
      console.error('Dashboard: Error loading resources:', resourcesError);
    }
  }, [resourcesError]);

  const handleNewResources = async (newResourcesData: Partial<Resource>[]) => {
    try {
      // Filter out resources with missing required fields
      const validResources = newResourcesData.filter(r => 
        r.vamid && r.name && r.joiningDate && r.grade
      ) as Omit<Resource, 'id'>[];
      
      if (validResources.length > 0) {
        await addResources(validResources);
        // Refetch resources after adding
        await refetch();
      }
    } catch (error) {
      console.error('Error adding resources:', error);
    }
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

  const isLoading = isLoadingResources;

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
        {resourcesError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>
              Failed to load data from database: {resourcesError.message}. Please check your console for details.
            </AlertDescription>
          </Alert>
        )}
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
