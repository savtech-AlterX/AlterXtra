import { validateBackup } from '../backup';
import { emptyAppStore } from '../../store/types';

describe('validateBackup', () => {
  it('accepts a well-formed AlterX backup', () => {
    const result = validateBackup({ app: 'AlterX', schemaVersion: 1, exportedAt: 'now', data: emptyAppStore });
    expect(result.ok).toBe(true);
  });

  it('rejects files missing the app marker', () => {
    const result = validateBackup({ schemaVersion: 1, data: emptyAppStore });
    expect(result.ok).toBe(false);
  });

  it('rejects files from a different app', () => {
    const result = validateBackup({ app: 'SomeOtherApp', schemaVersion: 1, data: emptyAppStore });
    expect(result.ok).toBe(false);
  });

  it('rejects non-object input without throwing', () => {
    expect(validateBackup(null).ok).toBe(false);
    expect(validateBackup('random string').ok).toBe(false);
    expect(validateBackup(42).ok).toBe(false);
  });

  it('rejects a missing or non-numeric schemaVersion', () => {
    expect(validateBackup({ app: 'AlterX', data: emptyAppStore }).ok).toBe(false);
    expect(validateBackup({ app: 'AlterX', schemaVersion: '1', data: emptyAppStore }).ok).toBe(false);
  });
});
