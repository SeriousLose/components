/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatRadioGroupHarness` instances. */
export interface RadioGroupHarnessFilters extends BaseHarnessFilters {
  /**
   * Only find instances whose name attribute is the given value.
   *
   * 只查找 name 属性为指定值的实例。
   *
   */
  name?: string;
}

/** A set of criteria that can be used to filter a list of `MatRadioButtonHarness` instances. */
export interface RadioButtonHarnessFilters extends BaseHarnessFilters {
  /**
   * Only find instances whose label matches the given value.
   *
   * 只查找标签与指定值匹配的实例。
   *
   */
  label?: string | RegExp;
  /**
   * Only find instances whose name attribute is the given value.
   *
   * 只查找 name 属性为指定值的实例。
   *
   */
  name?: string;
}
