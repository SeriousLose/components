/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, InjectionToken, Input} from '@angular/core';

let nextUniqueId = 0;

/**
 * Injection token that can be used to reference instances of `MatError`. It serves as
 * alternative token to the actual `MatError` class which could cause unnecessary
 * retention of the class and its directive metadata.
 *
 * 这个注入令牌可以用来引用 `MatError` 实例。它可以作为实际 `MatError` 类的备用令牌，直接使用实际类可能导致该类及其元数据无法被优化掉。
 *
 */
export const MAT_ERROR = new InjectionToken<MatError>('MatError');

/**
 * Single error message to be shown underneath the form field.
 *
 * 要在表单字段下方显示的单个错误消息。
 *
 */
@Directive({
  selector: 'mat-error',
  host: {
    'class': 'mat-error',
    'role': 'alert',
    '[attr.id]': 'id',
  },
  providers: [{provide: MAT_ERROR, useExisting: MatError}],
})
export class MatError {
  @Input() id: string = `mat-error-${nextUniqueId++}`;
}
