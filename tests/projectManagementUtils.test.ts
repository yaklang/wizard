import { describe, expect, it } from 'vitest';
import type { TSSAProject } from '../src/apis/SSAProjectApi/type';
import {
    dedupeSSAProjects,
    mergeSSAProjects,
} from '../src/pages/ProjecManagement/projectManagementUtils';

const createProject = (
    id: number | undefined,
    projectName: string,
): TSSAProject => ({
    id,
    project_name: projectName,
    language: 'go',
});

describe('projectManagementUtils', () => {
    it('dedupes repeated projects by id and keeps the first entry', () => {
        const projects = dedupeSSAProjects([
            createProject(1, 'alpha'),
            createProject(1, 'alpha-duplicate'),
            createProject(2, 'beta'),
        ]);

        expect(projects).toHaveLength(2);
        expect(projects[0].project_name).toBe('alpha');
        expect(projects[1].project_name).toBe('beta');
    });

    it('falls back to normalized project name when id is missing', () => {
        const projects = dedupeSSAProjects([
            createProject(undefined, ' My-App '),
            createProject(undefined, 'my-app'),
            createProject(undefined, 'other-app'),
        ]);

        expect(projects).toHaveLength(2);
        expect(projects.map((project) => project.project_name)).toEqual([
            ' My-App ',
            'other-app',
        ]);
    });

    it('merges pages without re-appending already loaded projects', () => {
        const merged = mergeSSAProjects(
            [createProject(1, 'alpha'), createProject(2, 'beta')],
            [createProject(2, 'beta-duplicate'), createProject(3, 'gamma')],
        );

        expect(merged).toHaveLength(3);
        expect(merged.map((project) => project.project_name)).toEqual([
            'alpha',
            'beta',
            'gamma',
        ]);
    });
});
