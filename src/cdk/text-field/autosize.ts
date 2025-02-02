/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  BooleanInput,
  coerceBooleanProperty,
  coerceNumberProperty,
  NumberInput
} from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
  DoCheck,
  OnDestroy,
  NgZone,
  HostListener,
  Optional,
  Inject,
} from '@angular/core';
import {Platform} from '@angular/cdk/platform';
import {auditTime, takeUntil} from 'rxjs/operators';
import {fromEvent, Subject} from 'rxjs';
import {DOCUMENT} from '@angular/common';

/**
 * Directive to automatically resize a textarea to fit its content.
 *
 * 用于自动调整 textarea 大小以适应其内容的指令。
 *
 */
@Directive({
  selector: 'textarea[cdkTextareaAutosize]',
  exportAs: 'cdkTextareaAutosize',
  host: {
    'class': 'cdk-textarea-autosize',
    // Textarea elements that have the directive applied should have a single row by default.
    // Browsers normally show two rows by default and therefore this limits the minRows binding.
    'rows': '1',
  },
})
export class CdkTextareaAutosize implements AfterViewInit, DoCheck, OnDestroy {
  /**
   * Keep track of the previous textarea value to avoid resizing when the value hasn't changed.
   *
   * 跟踪 textarea 的前值，以免在值没有变化时调整大小。
   *
   */
  private _previousValue?: string;
  private _initialHeight: string | undefined;
  private readonly _destroyed = new Subject<void>();

  private _minRows: number;
  private _maxRows: number;
  private _enabled: boolean = true;

  /**
   * Value of minRows as of last resize. If the minRows has decreased, the
   * height of the textarea needs to be recomputed to reflect the new minimum. The maxHeight
   * does not have the same problem because it does not affect the textarea's scrollHeight.
   *
   * 上次调整大小后 minRows 的值。如果 minRows 减小了，就需要重新计算 textarea 的高度以反映新的最小值。maxHeight 没有这样的问题，因为它不会影响 textarea 的 scrollHeight。
   *
   */
  private _previousMinRows: number = -1;

  private _textareaElement: HTMLTextAreaElement;

  /**
   * Minimum amount of rows in the textarea.
   *
   * textarea 中的最小行数。
   *
   */
  @Input('cdkAutosizeMinRows')
  get minRows(): number { return this._minRows; }
  set minRows(value: number) {
    this._minRows = coerceNumberProperty(value);
    this._setMinHeight();
  }

  /**
   * Maximum amount of rows in the textarea.
   *
   * textarea 中的最大行数。
   *
   */
  @Input('cdkAutosizeMaxRows')
  get maxRows(): number { return this._maxRows; }
  set maxRows(value: number) {
    this._maxRows = coerceNumberProperty(value);
    this._setMaxHeight();
  }

  /**
   * Whether autosizing is enabled or not
   *
   * 是否启用了自动调整大小的功能
   *
   */
  @Input('cdkTextareaAutosize')
  get enabled(): boolean { return this._enabled; }
  set enabled(value: boolean) {
    value = coerceBooleanProperty(value);

    // Only act if the actual value changed. This specifically helps to not run
    // resizeToFitContent too early (i.e. before ngAfterViewInit)
    if (this._enabled !== value) {
      (this._enabled = value) ? this.resizeToFitContent(true) : this.reset();
    }
  }

  /**
   * Cached height of a textarea with a single row.
   *
   * 单行 textarea 的缓存高度。
   *
   */
  private _cachedLineHeight: number;

  /**
   * Used to reference correct document/window
   *
   * 用于引用正确的 document/window
   *
   */
  protected _document?: Document;

  /**
   * Class that should be applied to the textarea while it's being measured.
   *
   * 当 textarea 正被测量时应用到 textarea 的类。
   *
   */
  private _measuringClass: string;

  constructor(private _elementRef: ElementRef<HTMLElement>,
              private _platform: Platform,
              private _ngZone: NgZone,
              /** @breaking-change 11.0.0 make document required */
              @Optional() @Inject(DOCUMENT) document?: any) {
    this._document = document;

    this._textareaElement = this._elementRef.nativeElement as HTMLTextAreaElement;
    this._measuringClass = _platform.FIREFOX ?
      'cdk-textarea-autosize-measuring-firefox' :
      'cdk-textarea-autosize-measuring';
  }

  /**
   * Sets the minimum height of the textarea as determined by minRows.
   *
   * 设置 textarea 的最小高度，由 minRows 决定。
   *
   */
  _setMinHeight(): void {
    const minHeight = this.minRows && this._cachedLineHeight ?
        `${this.minRows * this._cachedLineHeight}px` : null;

    if (minHeight)  {
      this._textareaElement.style.minHeight = minHeight;
    }
  }

  /**
   * Sets the maximum height of the textarea as determined by maxRows.
   *
   * 设置 textarea 的最大高度，由 maxRows 决定。
   *
   */
  _setMaxHeight(): void {
    const maxHeight = this.maxRows && this._cachedLineHeight ?
        `${this.maxRows * this._cachedLineHeight}px` : null;

    if (maxHeight) {
      this._textareaElement.style.maxHeight = maxHeight;
    }
  }

  ngAfterViewInit() {
    if (this._platform.isBrowser) {
      // Remember the height which we started with in case autosizing is disabled
      this._initialHeight = this._textareaElement.style.height;

      this.resizeToFitContent();

      this._ngZone.runOutsideAngular(() => {
        const window = this._getWindow();

        fromEvent(window, 'resize')
          .pipe(auditTime(16), takeUntil(this._destroyed))
          .subscribe(() => this.resizeToFitContent(true));
      });
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Cache the height of a single-row textarea if it has not already been cached.
   *
   * 缓存单行 textarea 的高度（如果尚未缓存）。
   *
   * We need to know how large a single "row" of a textarea is in order to apply minRows and
   * maxRows. For the initial version, we will assume that the height of a single line in the
   * textarea does not ever change.
   *
   * 为了应用 minRows 和 maxRows，我们需要知道 textarea 的单个“row”有多大。对于初始版本，我们假设 textarea 中单行的高度不会改变。
   *
   */
  private _cacheTextareaLineHeight(): void {
    if (this._cachedLineHeight) {
      return;
    }

    // Use a clone element because we have to override some styles.
    let textareaClone = this._textareaElement.cloneNode(false) as HTMLTextAreaElement;
    textareaClone.rows = 1;

    // Use `position: absolute` so that this doesn't cause a browser layout and use
    // `visibility: hidden` so that nothing is rendered. Clear any other styles that
    // would affect the height.
    textareaClone.style.position = 'absolute';
    textareaClone.style.visibility = 'hidden';
    textareaClone.style.border = 'none';
    textareaClone.style.padding = '0';
    textareaClone.style.height = '';
    textareaClone.style.minHeight = '';
    textareaClone.style.maxHeight = '';

    // In Firefox it happens that textarea elements are always bigger than the specified amount
    // of rows. This is because Firefox tries to add extra space for the horizontal scrollbar.
    // As a workaround that removes the extra space for the scrollbar, we can just set overflow
    // to hidden. This ensures that there is no invalid calculation of the line height.
    // See Firefox bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=33654
    textareaClone.style.overflow = 'hidden';

    this._textareaElement.parentNode!.appendChild(textareaClone);
    this._cachedLineHeight = textareaClone.clientHeight;
    this._textareaElement.parentNode!.removeChild(textareaClone);

    // Min and max heights have to be re-calculated if the cached line height changes
    this._setMinHeight();
    this._setMaxHeight();
  }

  ngDoCheck() {
    if (this._platform.isBrowser) {
      this.resizeToFitContent();
    }
  }

  /**
   * Resize the textarea to fit its content.
   *
   * 调整 textarea 的大小以适应它的内容。
   *
   * @param force Whether to force a height recalculation. By default the height will be
   *    recalculated only if the value changed since the last call.
   *
   * 是否强行重新计算高度。默认情况下，只有当自上一次调用后的值发生变化时，才会重新计算高度。
   *
   */
  resizeToFitContent(force: boolean = false) {
    // If autosizing is disabled, just skip everything else
    if (!this._enabled) {
      return;
    }

    this._cacheTextareaLineHeight();

    // If we haven't determined the line-height yet, we know we're still hidden and there's no point
    // in checking the height of the textarea.
    if (!this._cachedLineHeight) {
      return;
    }

    const textarea = this._elementRef.nativeElement as HTMLTextAreaElement;
    const value = textarea.value;

    // Only resize if the value or minRows have changed since these calculations can be expensive.
    if (!force && this._minRows === this._previousMinRows && value === this._previousValue) {
      return;
    }

    const placeholderText = textarea.placeholder;

    // Reset the textarea height to auto in order to shrink back to its default size.
    // Also temporarily force overflow:hidden, so scroll bars do not interfere with calculations.
    // Long placeholders that are wider than the textarea width may lead to a bigger scrollHeight
    // value. To ensure that the scrollHeight is not bigger than the content, the placeholders
    // need to be removed temporarily.
    textarea.classList.add(this._measuringClass);
    textarea.placeholder = '';

    // The measuring class includes a 2px padding to workaround an issue with Chrome,
    // so we account for that extra space here by subtracting 4 (2px top + 2px bottom).
    const height = textarea.scrollHeight - 4;

    // Use the scrollHeight to know how large the textarea *would* be if fit its entire value.
    textarea.style.height = `${height}px`;
    textarea.classList.remove(this._measuringClass);
    textarea.placeholder = placeholderText;

    this._ngZone.runOutsideAngular(() => {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => this._scrollToCaretPosition(textarea));
      } else {
        setTimeout(() => this._scrollToCaretPosition(textarea));
      }
    });

    this._previousValue = value;
    this._previousMinRows = this._minRows;
  }

  /**
   * Resets the textarea to its original size
   *
   * 把 textarea 重置为原始大小
   *
   */
  reset() {
    // Do not try to change the textarea, if the initialHeight has not been determined yet
    // This might potentially remove styles when reset() is called before ngAfterViewInit
    if (this._initialHeight !== undefined) {
      this._textareaElement.style.height = this._initialHeight;
    }
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('input')
  _noopInputHandler() {
    // no-op handler that ensures we're running change detection on input events.
  }

  /**
   * Access injected document if available or fallback to global document reference
   *
   * 访问已注入的 document（如果可用）或回退为对全局 document 的引用
   *
   */
  private _getDocument(): Document {
    return this._document || document;
  }

  /**
   * Use defaultView of injected document if available or fallback to global window reference
   *
   * 如果可用，则使用已注入的 document 的 defaultView 或者回退为对全局 window 的引用
   *
   */
  private _getWindow(): Window {
    const doc = this._getDocument();
    return doc.defaultView || window;
  }

  /**
   * Scrolls a textarea to the caret position. On Firefox resizing the textarea will
   * prevent it from scrolling to the caret position. We need to re-set the selection
   * in order for it to scroll to the proper position.
   *
   * 将 textarea 滚动到插入符的位置。在 Firefox 上，调整 textarea 的大小会阻止它滚动到插入位置。我们需要重新设置选定区，才能滚动到正确的位置。
   *
   */
  private _scrollToCaretPosition(textarea: HTMLTextAreaElement) {
    const {selectionStart, selectionEnd} = textarea;
    const document = this._getDocument();

    // IE will throw an "Unspecified error" if we try to set the selection range after the
    // element has been removed from the DOM. Assert that the directive hasn't been destroyed
    // between the time we requested the animation frame and when it was executed.
    // Also note that we have to assert that the textarea is focused before we set the
    // selection range. Setting the selection range on a non-focused textarea will cause
    // it to receive focus on IE and Edge.
    if (!this._destroyed.isStopped && document.activeElement === textarea) {
      textarea.setSelectionRange(selectionStart, selectionEnd);
    }
  }

  static ngAcceptInputType_minRows: NumberInput;
  static ngAcceptInputType_maxRows: NumberInput;
  static ngAcceptInputType_enabled: BooleanInput;
}
