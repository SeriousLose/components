/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ResolvedResource} from '../../update-tool/component-resource-collector';
import {WorkspacePath} from '../../update-tool/file-system';
import {Migration} from '../../update-tool/migration';
import {ElementSelectorUpgradeData} from '../data/element-selectors';
import {findAllSubstringIndices} from '../typescript/literal';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/**
 * Migration that walks through every string literal, template and stylesheet in order
 * to migrate outdated element selectors to the new one.
 *
 * 本迁移将遍历每个字符串文字、模板和样式表，以便将过时的元素选择器迁移到新的元素选择器。
 *
 */
export class ElementSelectorsMigration extends Migration<UpgradeData> {
  /**
   * Change data that upgrades to the specified target version.
   *
   * 升级到指定目标版本的更改数据。
   *
   */
  data = getVersionUpgradeData(this, 'elementSelectors');

  // Only enable the migration rule if there is upgrade data.
  enabled = this.data.length !== 0;

  visitNode(node: ts.Node): void {
    if (ts.isStringLiteralLike(node)) {
      this._visitStringLiteralLike(node);
    }
  }

  visitTemplate(template: ResolvedResource): void {
    this.data.forEach(selector => {
      findAllSubstringIndices(template.content, selector.replace)
          .map(offset => template.start + offset)
          .forEach(start => this._replaceSelector(template.filePath, start, selector));
    });
  }

  visitStylesheet(stylesheet: ResolvedResource): void {
    this.data.forEach(selector => {
      findAllSubstringIndices(stylesheet.content, selector.replace)
          .map(offset => stylesheet.start + offset)
          .forEach(start => this._replaceSelector(stylesheet.filePath, start, selector));
    });
  }

  private _visitStringLiteralLike(node: ts.StringLiteralLike) {
    if (node.parent && node.parent.kind !== ts.SyntaxKind.CallExpression) {
      return;
    }

    const textContent = node.getText();
    const filePath = this.fileSystem.resolve(node.getSourceFile().fileName);

    this.data.forEach(selector => {
      findAllSubstringIndices(textContent, selector.replace)
          .map(offset => node.getStart() + offset)
          .forEach(start => this._replaceSelector(filePath, start, selector));
    });
  }

  private _replaceSelector(filePath: WorkspacePath, start: number,
                           data: ElementSelectorUpgradeData) {
    this.fileSystem.edit(filePath)
      .remove(start, data.replace.length)
      .insertRight(start, data.replaceWith);
  }
}
