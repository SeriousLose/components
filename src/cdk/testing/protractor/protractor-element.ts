/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  _getTextWithExcludedElements,
  ElementDimensions,
  ModifierKeys,
  TestElement,
  TestKey,
  TextOptions,
  EventData,
} from '@angular/cdk/testing';
import {browser, Button, by, ElementFinder, Key} from 'protractor';

/**
 * Maps the `TestKey` constants to Protractor's `Key` constants.
 *
 * 将 `TestKey` 常量映射到 Protractor 的 `Key` 常量。
 *
 */
const keyMap = {
  [TestKey.BACKSPACE]: Key.BACK_SPACE,
  [TestKey.TAB]: Key.TAB,
  [TestKey.ENTER]: Key.ENTER,
  [TestKey.SHIFT]: Key.SHIFT,
  [TestKey.CONTROL]: Key.CONTROL,
  [TestKey.ALT]: Key.ALT,
  [TestKey.ESCAPE]: Key.ESCAPE,
  [TestKey.PAGE_UP]: Key.PAGE_UP,
  [TestKey.PAGE_DOWN]: Key.PAGE_DOWN,
  [TestKey.END]: Key.END,
  [TestKey.HOME]: Key.HOME,
  [TestKey.LEFT_ARROW]: Key.ARROW_LEFT,
  [TestKey.UP_ARROW]: Key.ARROW_UP,
  [TestKey.RIGHT_ARROW]: Key.ARROW_RIGHT,
  [TestKey.DOWN_ARROW]: Key.ARROW_DOWN,
  [TestKey.INSERT]: Key.INSERT,
  [TestKey.DELETE]: Key.DELETE,
  [TestKey.F1]: Key.F1,
  [TestKey.F2]: Key.F2,
  [TestKey.F3]: Key.F3,
  [TestKey.F4]: Key.F4,
  [TestKey.F5]: Key.F5,
  [TestKey.F6]: Key.F6,
  [TestKey.F7]: Key.F7,
  [TestKey.F8]: Key.F8,
  [TestKey.F9]: Key.F9,
  [TestKey.F10]: Key.F10,
  [TestKey.F11]: Key.F11,
  [TestKey.F12]: Key.F12,
  [TestKey.META]: Key.META
};

/**
 * Converts a `ModifierKeys` object to a list of Protractor `Key`s.
 *
 * 将 `ModifierKeys` 对象转换为 Protractor `Key` 的列表。
 *
 */
function toProtractorModifierKeys(modifiers: ModifierKeys): string[] {
  const result: string[] = [];
  if (modifiers.control) {
    result.push(Key.CONTROL);
  }
  if (modifiers.alt) {
    result.push(Key.ALT);
  }
  if (modifiers.shift) {
    result.push(Key.SHIFT);
  }
  if (modifiers.meta) {
    result.push(Key.META);
  }
  return result;
}

/**
 * A `TestElement` implementation for Protractor.
 *
 * 用于 Protractor 的 `TestElement`
 *
 */
export class ProtractorElement implements TestElement {
  constructor(readonly element: ElementFinder) {}

  async blur(): Promise<void> {
    return browser.executeScript('arguments[0].blur()', this.element);
  }

  async clear(): Promise<void> {
    return this.element.clear();
  }

  async click(...args: [ModifierKeys?] | ['center', ModifierKeys?] |
    [number, number, ModifierKeys?]): Promise<void> {
    await this._dispatchClickEventSequence(args, Button.LEFT);
  }

  async rightClick(...args: [ModifierKeys?] | ['center', ModifierKeys?] |
    [number, number, ModifierKeys?]): Promise<void> {
    await this._dispatchClickEventSequence(args, Button.RIGHT);
  }

  async focus(): Promise<void> {
    return browser.executeScript('arguments[0].focus()', this.element);
  }

  async getCssValue(property: string): Promise<string> {
    return this.element.getCssValue(property);
  }

  async hover(): Promise<void> {
    return browser.actions()
        .mouseMove(await this.element.getWebElement())
        .perform();
  }

  async mouseAway(): Promise<void> {
    return browser.actions()
        .mouseMove(await this.element.getWebElement(), {x: -1, y: -1})
        .perform();
  }

  async sendKeys(...keys: (string | TestKey)[]): Promise<void>;
  async sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;
  async sendKeys(...modifiersAndKeys: any[]): Promise<void> {
    const first = modifiersAndKeys[0];
    let modifiers: ModifierKeys;
    let rest: (string | TestKey)[];
    if (typeof first !== 'string' && typeof first !== 'number') {
      modifiers = first;
      rest = modifiersAndKeys.slice(1);
    } else {
      modifiers = {};
      rest = modifiersAndKeys;
    }

    const modifierKeys = toProtractorModifierKeys(modifiers);
    const keys = rest.map(k => typeof k === 'string' ? k.split('') : [keyMap[k]])
        .reduce((arr, k) => arr.concat(k), [])
        // Key.chord doesn't work well with geckodriver (mozilla/geckodriver#1502),
        // so avoid it if no modifier keys are required.
        .map(k => modifierKeys.length > 0 ? Key.chord(...modifierKeys, k) : k);

    return this.element.sendKeys(...keys);
  }

  async text(options?: TextOptions): Promise<string> {
    if (options?.exclude) {
      return browser.executeScript(_getTextWithExcludedElements, this.element, options.exclude);
    }
    return this.element.getText();
  }

  async getAttribute(name: string): Promise<string|null> {
    return browser.executeScript(
        `return arguments[0].getAttribute(arguments[1])`, this.element, name);
  }

  async hasClass(name: string): Promise<boolean> {
    const classes = (await this.getAttribute('class')) || '';
    return new Set(classes.split(/\s+/).filter(c => c)).has(name);
  }

  async getDimensions(): Promise<ElementDimensions> {
    const {width, height} = await this.element.getSize();
    const {x: left, y: top} = await this.element.getLocation();
    return {width, height, left, top};
  }

  async getProperty(name: string): Promise<any> {
    return browser.executeScript(`return arguments[0][arguments[1]]`, this.element, name);
  }

  async setInputValue(value: string): Promise<void> {
    return browser.executeScript(`arguments[0].value = arguments[1]`, this.element, value);
  }

  async selectOptions(...optionIndexes: number[]): Promise<void> {
    const options = await this.element.all(by.css('option'));
    const indexes = new Set(optionIndexes); // Convert to a set to remove duplicates.

    if (options.length && indexes.size) {
      // Reset the value so all the selected states are cleared. We can
      // reuse the input-specific method since the logic is the same.
      await this.setInputValue('');

      for (let i = 0; i < options.length; i++) {
        if (indexes.has(i)) {
          // We have to hold the control key while clicking on options so that multiple can be
          // selected in multi-selection mode. The key doesn't do anything for single selection.
          await browser.actions().keyDown(Key.CONTROL).perform();
          await options[i].click();
          await browser.actions().keyUp(Key.CONTROL).perform();
        }
      }
    }
  }

  async matchesSelector(selector: string): Promise<boolean> {
      return browser.executeScript(`
          return (Element.prototype.matches ||
                  Element.prototype.msMatchesSelector).call(arguments[0], arguments[1])
          `, this.element, selector);
  }

  async isFocused(): Promise<boolean> {
    return this.element.equals(browser.driver.switchTo().activeElement());
  }

  async dispatchEvent(name: string, data?: Record<string, EventData>): Promise<void> {
    return browser.executeScript(_dispatchEvent, name, this.element, data);
  }

  /**
   * Dispatches all the events that are part of a click event sequence.
   *
   * 派发属于 click 事件序列一部分的所有事件。
   *
   */
  private async _dispatchClickEventSequence(
    args: [ModifierKeys?] | ['center', ModifierKeys?] |
      [number, number, ModifierKeys?],
    button: string) {
    let modifiers: ModifierKeys = {};
    if (args.length && typeof args[args.length - 1] === 'object') {
      modifiers = args.pop() as ModifierKeys;
    }
    const modifierKeys = toProtractorModifierKeys(modifiers);

    // Omitting the offset argument to mouseMove results in clicking the center.
    // This is the default behavior we want, so we use an empty array of offsetArgs if
    // no args remain after popping the modifiers from the args passed to this function.
    const offsetArgs = (args.length === 2 ?
      [{x: args[0], y: args[1]}] : []) as [{x: number, y: number}];

    let actions = browser.actions()
      .mouseMove(await this.element.getWebElement(), ...offsetArgs);

    for (const modifierKey of modifierKeys) {
      actions = actions.keyDown(modifierKey);
    }
    actions = actions.click(button);
    for (const modifierKey of modifierKeys) {
      actions = actions.keyUp(modifierKey);
    }

    await actions.perform();
  }
}

/**
 * Dispatches an event with a particular name and data to an element.
 * Note that this needs to be a pure function, because it gets stringified by
 * Protractor and is executed inside the browser.
 *
 * 将具有特定名称和数据的事件派发到元素。请注意，这必须是纯函数，因为它会由 Protractor 进行字符串化并在浏览器中执行。
 *
 */
function _dispatchEvent(name: string, element: ElementFinder, data?: Record<string, EventData>) {
  const event = document.createEvent('Event');
  event.initEvent(name);

  if (data) {
    // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the original object.
    Object.assign(event, data);
  }

  // This type has a string index signature, so we cannot access it using a dotted property access.
  element['dispatchEvent'](event);
}
