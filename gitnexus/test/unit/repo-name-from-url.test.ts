/**
 * Unit tests: repoNameFromUrl (hold-queue repo matching in src/server/api.ts).
 *
 * The previous implementation was `path.basename(url).replace('.git', '')`.
 * `String.prototype.replace` with a *string* pattern removes the first match
 * anywhere in the string, not an anchored suffix, so any repo whose name
 * contains `.git` before the end was mangled and never matched the running job.
 */
import { describe, it, expect } from 'vitest';
import { repoNameFromUrl } from '../../src/server/git-clone.js';

describe('repoNameFromUrl', () => {
  it('strips a trailing .git suffix', () => {
    expect(repoNameFromUrl('https://github.com/user/repo.git')).toBe('repo');
  });

  it('leaves names without a .git suffix alone', () => {
    expect(repoNameFromUrl('https://github.com/user/repo')).toBe('repo');
  });

  it('does not strip .git from the middle of a repo name', () => {
    // Previously: 'blog.github.io' -> 'bloghub.io'
    expect(repoNameFromUrl('https://github.com/user/blog.github.io')).toBe('blog.github.io');
    expect(repoNameFromUrl('https://gitlab.com/u/mysite.gitlab.io')).toBe('mysite.gitlab.io');
    expect(repoNameFromUrl('https://github.com/u/foo.gitignore-tool')).toBe('foo.gitignore-tool');
  });

  it('handles a mid-name .git together with a real .git suffix', () => {
    expect(repoNameFromUrl('https://github.com/user/blog.github.io.git')).toBe('blog.github.io');
  });

  it('lower-cases the result for case-insensitive matching', () => {
    expect(repoNameFromUrl('https://github.com/User/MyRepo.git')).toBe('myrepo');
  });

  it('handles scp-style and trailing-slash URLs', () => {
    expect(repoNameFromUrl('git@github.com:user/repo.git')).toBe('repo');
    expect(repoNameFromUrl('https://github.com/user/repo/')).toBe('repo');
  });

  it('returns null instead of throwing on an unparseable URL', () => {
    expect(repoNameFromUrl('')).toBeNull();
    expect(repoNameFromUrl('https://github.com/user/..')).toBeNull();
    expect(repoNameFromUrl('https://github.com/user/bad name!')).toBeNull();
  });
});
