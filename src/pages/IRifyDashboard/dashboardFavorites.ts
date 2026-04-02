import type { TSSAProjectFavoriteItem } from '@/apis/SSAProjectApi/type';

export const DASHBOARD_FAVORITES_LIMIT = 5;

const normalizeProjectName = (projectName?: string) => (projectName || '').trim();

export const makeDashboardProjectKey = (
    projectId?: number,
    projectName?: string,
) => {
    const normalizedName = normalizeProjectName(projectName).toLowerCase();
    if (projectId && projectId > 0) {
        return `id:${projectId}`;
    }
    return `name:${normalizedName}`;
};

const isFavoriteRecord = (
    value: unknown,
): value is TSSAProjectFavoriteItem => {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const candidate = value as TSSAProjectFavoriteItem;
    return (
        typeof candidate.project_name === 'string' &&
        typeof candidate.pinned_at === 'number'
    );
};

export const normalizeDashboardFavorites = (
    favorites: TSSAProjectFavoriteItem[],
) => {
    const seen = new Set<string>();
    return favorites
        .filter(isFavoriteRecord)
        .filter((item) => {
            const key = makeDashboardProjectKey(item.id, item.project_name);
            const projectName = normalizeProjectName(item.project_name);
            if (!key || !projectName || seen.has(key)) {
                return false;
            }
            seen.add(key);
            item.project_name = projectName;
            return true;
        })
        .sort((left, right) => (right.pinned_at || 0) - (left.pinned_at || 0))
        .slice(0, DASHBOARD_FAVORITES_LIMIT);
};

export const buildFavoriteProjectIDSet = (
    favorites: TSSAProjectFavoriteItem[],
) => new Set(
    favorites
        .map((item) => item.id)
        .filter((id): id is number => typeof id === 'number'),
);
