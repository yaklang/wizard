import type { TSSAProject } from '@/apis/SSAProjectApi/type';

const normalizeProjectName = (projectName: string): string =>
    projectName.trim().toLowerCase();

export const getSSAProjectIdentityKey = (project: TSSAProject): string => {
    if (typeof project.id === 'number') {
        return `id:${project.id}`;
    }
    return `name:${normalizeProjectName(project.project_name)}`;
};

export const dedupeSSAProjects = (projects: TSSAProject[]): TSSAProject[] => {
    const seen = new Set<string>();
    return projects.filter((project) => {
        const key = getSSAProjectIdentityKey(project);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};

export const mergeSSAProjects = (
    existing: TSSAProject[],
    incoming: TSSAProject[],
): TSSAProject[] => dedupeSSAProjects([...existing, ...incoming]);
