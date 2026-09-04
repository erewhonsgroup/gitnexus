/**
 * Unit tests: C# namespace -> directory resolution (linear-scan fallback).
 *
 * The fallback scan located the namespace directory with a bare
 * `indexOf('Models/')`, which matches *mid-segment* ("src/OtherModels/").
 * Any directory whose name merely ENDS WITH the namespace segment was
 * resolved as if it were that namespace, producing wrong import edges.
 */
import { describe, it, expect } from 'vitest';
import { resolveCSharpImportInternal } from '../../src/core/ingestion/import-resolvers/csharp.js';
import { EMPTY_INDEX } from '../../src/core/ingestion/import-resolvers/utils.js';
import type { CSharpProjectConfig } from '../../src/core/ingestion/language-config.js';

const configs: CSharpProjectConfig[] = [{ rootNamespace: 'MyApp', projectDir: '' }];

/** Resolve against a file list, forcing the linear-scan fallback (EMPTY_INDEX). */
function resolve(importPath: string, files: string[]): string[] {
  return resolveCSharpImportInternal(importPath, configs, files, files, EMPTY_INDEX);
}

describe('resolveCSharpImportInternal — directory segment anchoring', () => {
  it('does not resolve a namespace to a directory that merely ends with its name', () => {
    const files = ['src/Models/Thing.cs', 'src/OtherModels/User.cs'];
    const result = resolve('MyApp.Models', files);

    // Previously 'src/OtherModels/User.cs' was included: "src/OtherModels/"
    // contains the substring "Models/" at index 9.
    expect(result).toEqual(['src/Models/Thing.cs']);
    expect(result).not.toContain('src/OtherModels/User.cs');
  });

  it('still resolves a namespace directory at the start of the path', () => {
    const files = ['Models/Thing.cs'];
    expect(resolve('MyApp.Models', files)).toEqual(['Models/Thing.cs']);
  });

  it('still resolves a namespace directory nested mid-path', () => {
    const files = ['src/app/Models/Thing.cs'];
    expect(resolve('MyApp.Models', files)).toEqual(['src/app/Models/Thing.cs']);
  });

  it('only returns files directly inside the namespace directory', () => {
    const files = ['src/Models/Thing.cs', 'src/Models/Nested/Deep.cs'];
    expect(resolve('MyApp.Models', files)).toEqual(['src/Models/Thing.cs']);
  });

  it('resolves multi-segment namespaces without mid-segment false positives', () => {
    const files = ['src/Models/Dto/Order.cs', 'src/XModels/Dto/Bogus.cs'];
    expect(resolve('MyApp.Models.Dto', files)).toEqual(['src/Models/Dto/Order.cs']);
  });
});
