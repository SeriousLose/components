/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Migration} from '../../update-tool/migration';

import {PropertyNameUpgradeData} from '../data';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/**
 * Migration that walks through every property access expression and updates
 * accessed properties that have been updated to a new name.
 *
 * 本迁移会遍历每个属性访问表达式并更新已更新为新名称的访问属性。
 *
 */
export class PropertyNamesMigration extends Migration<UpgradeData> {
  /**
   * Change data that upgrades to the specified target version.
   *
   * 升级到指定目标版本的更改数据。
   *
   */
  data: PropertyNameUpgradeData[] = getVersionUpgradeData(this, 'propertyNames');

  // Only enable the migration rule if there is upgrade data.
  enabled = this.data.length !== 0;

  visitNode(node: ts.Node): void {
    if (ts.isPropertyAccessExpression(node)) {
      this._visitPropertyAccessExpression(node);
    }
  }

  private _visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    const hostType = this.typeChecker.getTypeAtLocation(node.expression);
    const typeName = hostType && hostType.symbol && hostType.symbol.getName();

    this.data.forEach(data => {
      if (node.name.text !== data.replace) {
        return;
      }

      if (!data.limitedTo || data.limitedTo.classes.includes(typeName)) {
        this.fileSystem.edit(this.fileSystem.resolve(node.getSourceFile().fileName))
          .remove(node.name.getStart(), node.name.getWidth())
          .insertRight(node.name.getStart(), data.replaceWith);
      }
    });
  }
}
