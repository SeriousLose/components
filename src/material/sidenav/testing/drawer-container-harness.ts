/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentContainerComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {DrawerContainerHarnessFilters, DrawerHarnessFilters} from './drawer-harness-filters';
import {MatDrawerContentHarness} from './drawer-content-harness';
import {MatDrawerHarness} from './drawer-harness';

/**
 * Harness for interacting with a standard mat-drawer-container in tests.
 *
 * 在测试中用来与标准 mat-drawer-container 进行交互的测试工具。
 *
 */
export class MatDrawerContainerHarness extends ContentContainerComponentHarness<string> {
  /** The selector for the host element of a `MatDrawerContainer` instance. */
  static hostSelector = '.mat-drawer-container';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatDrawerContainerHarness` that
   * meets certain criteria.
   * @param options Options for filtering which container instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   *
   * 用指定选项配置过的 `HarnessPredicate` 服务。
   */
  static with(options: DrawerContainerHarnessFilters = {}):
    HarnessPredicate<MatDrawerContainerHarness> {
    return new HarnessPredicate(MatDrawerContainerHarness, options);
  }

  /**
   * Gets drawers that match particular criteria within the container.
   * @param filter Optionally filters which chips are included.
   *
   * 可选择过滤哪些纸片。
   *
   */
  async getDrawers(filter: DrawerHarnessFilters = {}): Promise<MatDrawerHarness[]> {
    return this.locatorForAll(MatDrawerHarness.with(filter))();
  }

  /** Gets the element that has the container's content. */
  async getContent(): Promise<MatDrawerContentHarness> {
    return this.locatorFor(MatDrawerContentHarness)();
  }
}
