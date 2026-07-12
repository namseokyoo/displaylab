import { describe, expect, it } from 'vitest';
import { PANEL_TECHNOLOGIES } from '../panel-technologies';

describe('panel technology localization contract', () => {
  it('provides complete English and Korean structured content for every panel', () => {
    expect(PANEL_TECHNOLOGIES).toHaveLength(5);

    for (const panel of PANEL_TECHNOLOGIES) {
      expect(panel.description.en.trim()).not.toBe('');
      expect(panel.description.ko.trim()).not.toBe('');
      for (const group of [panel.pros, panel.cons, panel.bestFor]) {
        expect(group.length).toBeGreaterThan(0);
        for (const item of group) {
          expect(item.en.trim()).not.toBe('');
          expect(item.ko.trim()).not.toBe('');
        }
      }
    }
  });
});
