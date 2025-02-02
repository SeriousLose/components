Angular Material's stepper provides a wizard-like workflow by dividing content into logical steps.

Angular Material 的步进器通过把内容拆分成一些逻辑步骤，提供了一个向导式的工作流。

<!-- example(stepper-overview) -->

Material stepper builds on the foundation of the CDK stepper that is responsible for the logic
that drives a stepped workflow. Material stepper extends the CDK stepper and has Material Design
styling.

Material 步进器基于 CDK 中的步进器 —— 它负责实现驱动步进式工作流的逻辑部分。而 Material 步进器扩展了 CDK 的步进器，让它具有 Material Design 的样式。

### Stepper variants

### 步进器的变体形式

There are two stepper components: `mat-horizontal-stepper` and `mat-vertical-stepper`. They
can be used the same way. The only difference is the orientation of stepper.

有两个步进器组件：`mat-horizontal-stepper` 和 `mat-vertical-stepper`。
他们可以用相同方式使用，唯一的区别是步进器的方向。

<!-- example(stepper-overview) -->

<!-- example(stepper-vertical) -->

`mat-horizontal-stepper` selector can be used to create a horizontal stepper, and
`mat-vertical-stepper` can be used to create a vertical stepper. `mat-step` components need to be
placed inside either one of the two stepper components.

`mat-horizontal-stepper` 选择器用来创建水平步进器，而 `mat-vertical-stepper` 用来创建垂直步进器。`mat-step` 要放在这两种步进器组件中的任何一个中。

### Labels

### 标签

If a step's label is only text, then the `label` attribute can be used.

如果步进器的标签只是纯文本，那么可以使用 `label` 属性。

<!-- example({"example": "stepper-overview",
              "file": "stepper-overview-example.html",
              "region": "label"}) -->

For more complex labels, add a template with the `matStepLabel` directive inside the
`mat-step`.

对于更复杂的标签，可以在 `mat-step` 的 `matStepLabel` 指令中添加一个模板。

<!-- example({"example": "stepper-editable",
              "file": "stepper-editable-example.html",
              "region": "step-label"}) -->

#### Label position

#### 标签位置

For `mat-horizontal-stepper` it's possible to define the position of the label. `end` is the
default value, while `bottom` will place it under the step icon instead of at its side.
This behaviour is controlled by `labelPosition` property.

`mat-horizontal-stepper` 可以定义标签的位置。`end` 是默认值，而 `bottom` 会把它放在步骤图标的下面而不是侧面。这个行为是由 `labelPosition` 属性控制的。

<!-- example({"example": "stepper-label-position-bottom",
              "file": "stepper-label-position-bottom-example.html",
              "region": "label-position"}) -->

### Stepper buttons

### 步进器按钮

There are two button directives to support navigation between different steps:
`matStepperPrevious` and `matStepperNext`.

有两个按钮指令用来支持不同步骤之间的导航：`matStepperPrevious` 和 `matStepperNext`。

<!-- example({"example": "stepper-label-position-bottom",
              "file": "stepper-label-position-bottom-example.html",
              "region": "buttons"}) -->

### Linear stepper

### 线性步进器

The `linear` attribute can be set on `mat-horizontal-stepper` and `mat-vertical-stepper` to create
a linear stepper that requires the user to complete previous steps before proceeding to following
steps. For each `mat-step`, the `stepControl` attribute can be set to the top level
`AbstractControl` that is used to check the validity of the step.

可以设置 `mat-horizontal-stepper` 和 `mat-vertical-stepper` 的 `linear` 属性来创建线性步进器，它会要求用户必须完成了前面的步骤才能继续。
对于每个 `mat-step`，都可以把它的 `stepControl` 属性设置为一个上级 `AbstractControl` 来检查该步骤的有效性。

There are two possible approaches. One is using a single form for stepper, and the other is
using a different form for each step.

有两种可能的实现方式。一种是为整个步进器使用单一表单，另一种是为每个步骤都使用不同的表单。

Alternatively, if you don't want to use the Angular forms, you can pass in the `completed` property
to each of the steps which won't allow the user to continue until it becomes `true`. Note that if
both `completed` and `stepControl` are set, the `stepControl` will take precedence.

另外，如果你不想使用 Angular 的表单，也可以为每个步骤传入一个 `completed` 属性，在它变为 `true` 之前，都会阻止用户前进。
注意，如果同时设置了 `completed` 和 `stepControl`，那么 `stepControl` 优先。

#### Using a single form

#### 使用单一表单

When using a single form for the stepper, `matStepperPrevious` and `matStepperNext` have to be
set to `type="button"` in order to prevent submission of the form before all steps
are completed.

当步进器使用单一表单时，`matStepperPrevious` 和 `matStepperNext` 所在的元素都应该设置为 `type="button"`，以防止在完成了所有步骤之前提交该表单。

```html
<form [formGroup]="formGroup">
  <mat-horizontal-stepper formArrayName="formArray" linear>
    <mat-step formGroupName="0" [stepControl]="formArray.get([0])">
      ...
      <div>
        <button mat-button matStepperNext type="button">Next</button>
      </div>
    </mat-step>
    <mat-step formGroupName="1" [stepControl]="formArray.get([1])">
      ...
      <div>
        <button mat-button matStepperPrevious type="button">Back</button>
        <button mat-button matStepperNext type="button">Next</button>
      </div>
    </mat-step>
    ...
  </mat-horizontal-stepper>
</form>
```

#### Using a different form for each step

#### 为每个步骤使用不同的表单

```html
<mat-vertical-stepper linear>
  <mat-step [stepControl]="formGroup1">
    <form [formGroup]="formGroup1">
      ...
    </form>
  </mat-step>
  <mat-step [stepControl]="formGroup2">
    <form [formGroup]="formGroup2">
      ...
    </form>
  </mat-step>
</mat-vertical-stepper>
```
### Types of steps

### 步骤的类型

#### Optional step

#### 可选步骤

If completion of a step in linear stepper is not required, then the `optional` attribute can be set
on `mat-step`.

如果线性步进器中的某个步骤不是必须完成的，可以在那个 `mat-step` 上设置 `optional` 属性。

<!-- example({"example": "stepper-optional",
              "file": "stepper-optional-example.html",
              "region": "optional"}) -->


#### Editable step

#### 可编辑的步骤

By default, steps are editable, which means users can return to previously completed steps and
edit their responses. `editable="false"` can be set on `mat-step` to change the default.

默认情况下，每个步骤都是可编辑的，也就是说用户可以回到前一个已经完成的步骤，并编辑他们的回复。可以设置 `mat-step` 的 `editable="true"` 来修改这种默认行为。 

<!-- example({"example": "stepper-editable",
              "file": "stepper-editable-example.html",
              "region": "editable"}) -->

#### Completed step

#### 已完成的步骤

By default, the `completed` attribute of a step returns `true` if the step is valid (in case of
linear stepper) and the user has interacted with the step. The user, however, can also override
this default `completed` behavior by setting the `completed` attribute as needed.

默认情况下，如果步骤是有效的（对于线性步进器），并且用户已经与该步骤进行过互动，那么该步骤的 `completed` 属性就会是 `true`。
不过，用户可以通过按需设置 `completed` 属性，来改写这种默认的 `completed` 行为。

#### Overriding icons

#### 改写图标

By default, the step headers will use the `create` and `done` icons from the Material design icon
set via `<mat-icon>` elements. If you want to provide a different set of icons, you can do so
by placing a `matStepperIcon` for each of the icons that you want to override. The `index`,
`active`, and `optional` values of the individual steps are available through template variables:

默认情况下，步骤头中会通过 `<mat-icon>` 元素来设置 Material Design 中的 `create` 和 `done` 图标。
如果你要提供另一个图标集，则可以为要覆盖的图标单独设置 `matStepperIcon`。每个步骤的 `index`、`active` 和 `optional`
的值都可以通过模板变量进行访问：

<!-- example({"example": "stepper-states",
              "file": "stepper-states-example.html",
              "region": "override-icons"}) -->

Note that you aren't limited to using the `mat-icon` component when providing custom icons.

注意，要想提供自定义图标，你不一定非要用 `mat-icon` 组件。

#### Step States

#### 步骤的状态

You can set the state of a step to whatever you want. The given state by default maps to an icon.
However, it can be overridden the same way as mentioned above.

你可以随意设置某个步骤的状态。默认情况下，指定的状态会映射到一个图标。不过，你也同样可以像前面所说的那样去覆盖它。

<!-- example({"example": "stepper-states",
              "file": "stepper-states-example.html",
              "region": "states"}) -->

In order to use the custom step states, you must add the `displayDefaultIndicatorType` option to
the global default stepper options which can be specified by providing a value for
`STEPPER_GLOBAL_OPTIONS` in your application's root module.

为了使用自定义的步骤状态，你必须把 `displayDefaultIndicatorType` 选项添加到全局的默认步进器选项中。你可以通过在应用的根模块中给 `STEPPER_GLOBAL_OPTIONS` 令牌提供一个值来指定它。

```ts
@NgModule({
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    }
  ]
})
```

<!-- example(stepper-states) -->

### Error State

### 错误状态

If you want to show an error when the user moved past a step that hasn't been filled out correctly,
you can set the error message through the `errorMessage` input and configure the stepper to show
errors via the `showError` option in the `STEPPER_GLOBAL_OPTIONS` injection token. Note that since
`linear` steppers prevent a user from advancing past an invalid step to begin with, this setting
will not affect steppers marked as `linear`.

如果要在用户移过一个尚未正确填写的步骤时显示错误，可以通过输入属性 `errorMessage` 设置错误信息。并且通过 `STEPPER_GLOBAL_OPTIONS` 令牌中的 `showError` 选项配置步进器显示错误的方式。请注意，由于 `linear` 步进器会阻止用户跳过无效的步骤，因此该设置不会影响标记为 `linear` 的步进器。

```ts
@NgModule({
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
```

<!-- example(stepper-errors) -->

### Keyboard interaction

### 键盘交互

- <kbd>LEFT_ARROW</kbd>: Focuses the previous step header

  <kbd>LEFT_ARROW</kbd>：焦点移到前一个步骤上

- <kbd>RIGHT_ARROW</kbd>: Focuses the next step header

  <kbd>RIGHT_ARROW</kbd>：焦点移到下一个步骤上

- <kbd>HOME</kbd>: Focuses the first step header

  <kbd>HOME</kbd>: 焦点移到第一个步骤上

- <kbd>END</kbd>: Focuses the last step header

  <kbd>END</kbd>: 焦点移到最后一个步骤上

- <kbd>ENTER</kbd>, <kbd>SPACE</kbd>: Selects the step that the focus is currently on

  <kbd>ENTER</kbd>, <kbd>SPACE</kbd>：选择当前拥有焦点的步骤

- <kbd>TAB</kbd>: Focuses the next tabbable element

  <kbd>TAB</kbd>：焦点移到下一个可捕获焦点的元素上

- <kbd>SHIFT</kbd>+<kbd>TAB</kbd>: Focuses the previous tabbable element

  <kbd>TAB</kbd>+<kbd>SHIFT</kbd>：焦点移到上一个可捕获焦点的元素上

### Localizing labels

### 本地化标签

Labels used by the stepper are provided through `MatStepperIntl`. Localization of these messages
can be done by providing a subclass with translated values in your application root module.

步进器所用的标签是通过 `MatStepperIntl` 提供的。要想对这些消息进行本地化，可以在应用的根模块中提供它的一个带翻译值的子类。

```ts
@NgModule({
  imports: [MatStepperModule],
  providers: [
    {provide: MatStepperIntl, useClass: MyIntl},
  ],
})
export class MyApp {}
```

### Accessibility

### 无障碍性

The stepper is treated as a tabbed view for accessibility purposes, so it is given
`role="tablist"` by default. The header of step that can be clicked to select the step
is given `role="tab"`, and the content that can be expanded upon selection is given
`role="tabpanel"`. `aria-selected` attribute of step header and `aria-expanded` attribute of
step content is automatically set based on step selection change.

从无障碍性的角度看，步进器和选项卡视图是一样的，所以默认会为它指定 `role="tablist"`。
步骤的头可以点击，以选择该步骤，所以指定 `role="tab"`，其内容可以在选中时展开，所以指定 `role="tabpanel"`。
步骤头的 `aria-selected` 属性和步骤内容的 `aria-expanded` 属性会根据其选中状态的变化进行自动设置。

The stepper and each step should be given a meaningful label via `aria-label` or `aria-labelledby`.

步进器和每个步骤都应该通过 `aria-label` 或 `aria-labelledby` 给出一个有意义的标签。

