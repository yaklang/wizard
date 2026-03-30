import { describe, expect, it } from 'vitest';
import type { TSSAProjectFavoriteItem } from '../src/apis/SSAProjectApi/type';
import {
    buildFavoriteProjectIDSet,
    DASHBOARD_FAVORITES_LIMIT,
    makeDashboardProjectKey,
    normalizeDashboardFavorites,
} from '../src/pages/IRifyDashboard/dashboardFavorites';

const createFavorite = (
    id: number | undefined,
    projectName: string,
    pinnedAt: number,
): TSSAProjectFavoriteItem => ({
    id,
    projectName,
    project_name: projectName,
    pinned_at: pinnedAt,
});

describe('dashboardFavorites', () => {
    it('prefers project id when building a storage key', () => {
        expect(makeDashboardProjectKey(7, 'Alpha')).toBe('id:7');
    });

    it('falls back to normalized project name when id is missing', () => {
        expect(makeDashboardProjectKey(undefined, ' My-App ')).toBe(
            'name:my-app',
        );
    });

    it('dedupes favorites by key and keeps newest pinned items first', () => {
        const favorites = normalizeDashboardFavorites([
            createFavorite(1, ' alpha ', 10),
            createFavorite(2, 'beta', 30),
            createFavorite(1, 'alpha duplicate', 20),
        ]);

        expect(favorites).toHaveLength(2);
        expect(
            favorites.map((item) =>
                makeDashboardProjectKey(item.id, item.project_name),
            ),
        ).toEqual(['id:2', 'id:1']);
        expect(favorites[1].project_name).toBe('alpha');
    });

    it('caps the favorites list to the configured limit', () => {
        const favorites = normalizeDashboardFavorites(
            Array.from({ length: DASHBOARD_FAVORITES_LIMIT + 2 }, (_, index) =>
                createFavorite(
                    index + 1,
                    `project-${index + 1}`,
                    index + 1,
                ),
            ),
        );

        expect(favorites).toHaveLength(DASHBOARD_FAVORITES_LIMIT);
        expect(favorites[0].id).toBe(
            DASHBOARD_FAVORITES_LIMIT + 2,
        );
    });

    it('builds a fast lookup set for favorite project ids', () => {
        const favorites = normalizeDashboardFavorites([
            createFavorite(7, 'alpha', 10),
            createFavorite(11, 'beta', 20),
        ]);

        const idSet = buildFavoriteProjectIDSet(favorites);

        expect(idSet.has(7)).toBe(true);
        expect(idSet.has(11)).toBe(true);
        expect(idSet.has(42)).toBe(false);
    });
});
