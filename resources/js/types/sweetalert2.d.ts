declare global {

    namespace Swal {
        function fire<T = any>(options: SweetAlertOptions): Promise<SweetAlertResult<Awaited<T>>>
        function fire<T = any>(title?: string, html?: string, icon?: SweetAlertIcon): Promise<SweetAlertResult<Awaited<T>>>
        function mixin(options: SweetAlertOptions): typeof Swal
        function isVisible(): boolean
        function update(options: Pick<SweetAlertOptions, SweetAlertUpdatableParameters>): void
        function close(result?: Partial<SweetAlertResult>): void
        function getContainer(): HTMLElement | null
        function getPopup(): HTMLElement | null
        function getTitle(): HTMLElement | null
        function getProgressSteps(): HTMLElement | null
        function getHtmlContainer(): HTMLElement | null
        function getImage(): HTMLElement | null
        function getCloseButton(): HTMLButtonElement | null
        function getIcon(): HTMLElement | null
        function getIconContent(): HTMLElement | null
        function getConfirmButton(): HTMLButtonElement | null
        function getDenyButton(): HTMLButtonElement | null
        function getCancelButton(): HTMLButtonElement | null
        function getActions(): HTMLElement | null
        function getFooter(): HTMLElement | null
        function getTimerProgressBar(): HTMLElement | null
        function getFocusableElements(): readonly HTMLElement[]
        function enableButtons(): void
        function disableButtons(): void
        function showLoading(buttonToReplace?: HTMLButtonElement | null): void
        function hideLoading(): void
        function isLoading(): boolean
        function clickConfirm(): void
        function clickDeny(): void
        function clickCancel(): void
        function showValidationMessage(validationMessage: string): void
        function resetValidationMessage(): void
        function getInput(): HTMLInputElement | null
        function disableInput(): void
        function enableInput(): void
        function getValidationMessage(): HTMLElement | null
        function getTimerLeft(): number | undefined
        function stopTimer(): number | undefined
        function resumeTimer(): number | undefined
        function toggleTimer(): number | undefined
        function isTimerRunning(): boolean | undefined
        function increaseTimer(ms: number): number | undefined
        function bindClickHandler(attribute?: string): void
        function isValidParameter(paramName: string): paramName is keyof SweetAlertOptions
        function isUpdatableParameter(paramName: string): paramName is SweetAlertUpdatableParameters
        function argsToParams(params: SweetAlertArrayOptions | readonly [SweetAlertOptions]): SweetAlertOptions

        const DismissReason: {
            readonly cancel: 'cancel'
            readonly backdrop: 'backdrop'
            readonly close: 'close'
            readonly esc: 'esc'
            readonly timer: 'timer'
        }

        const version: string
    }

    interface SweetAlertHideShowClass {
        backdrop?: string | readonly string[]
        icon?: string | readonly string[]
        popup?: string | readonly string[]
    }

    type Awaited<T> = T extends Promise<infer U> ? U : T
    type SyncOrAsync<T> = T | Promise<T> | { toPromise: () => T }
    type ValueOrThunk<T> = T | (() => T)

    export type SweetAlertArrayOptions = readonly [string?, string?, SweetAlertIcon?]
    export type SweetAlertGrow = 'row' | 'column' | 'fullscreen' | false
    export type SweetAlertHideClass = SweetAlertHideShowClass
    export type SweetAlertShowClass = Readonly<SweetAlertHideShowClass>
    export type SweetAlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question'
    export type SweetAlertEventName = 'didRender' | 'willOpen' | 'didOpen' | 'willClose' | 'didClose' | 'didDestroy'

    export type SweetAlertInput =
        | 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'range'
        | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'url'
        | 'date' | 'datetime-local' | 'time' | 'week' | 'month'

    type SweetAlertStringInput = Exclude<SweetAlertInput, 'file'>

    type SweetAlertInputValidator =
        | {
            input?: SweetAlertStringInput
            inputValidator?: (value: string) => SyncOrAsync<string | null | false | void>
        }
        | {
            input: 'file'
            inputValidator?: (file: File | FileList | null) => SyncOrAsync<string | null | false | void>
        }

    export type SweetAlertTheme =
        | 'light' | 'dark' | 'auto' | 'minimal' | 'borderless'
        | 'bootstrap-4' | 'bootstrap-4-light' | 'bootstrap-4-dark'
        | 'bootstrap-5' | 'bootstrap-5-light' | 'bootstrap-5-dark'
        | 'material-ui' | 'material-ui-light' | 'material-ui-dark'
        | 'embed-iframe' | 'bulma' | 'bulma-light' | 'bulma-dark'

    export type SweetAlertPosition =
        | 'top' | 'top-start' | 'top-end' | 'top-left' | 'top-right'
        | 'center' | 'center-start' | 'center-end' | 'center-left' | 'center-right'
        | 'bottom' | 'bottom-start' | 'bottom-end' | 'bottom-left' | 'bottom-right'

    export type SweetAlertUpdatableParameters =
        | 'allowEscapeKey' | 'allowOutsideClick' | 'background' | 'buttonsStyling'
        | 'cancelButtonAriaLabel' | 'cancelButtonColor' | 'cancelButtonText'
        | 'closeButtonAriaLabel' | 'closeButtonHtml' | 'confirmButtonAriaLabel'
        | 'confirmButtonColor' | 'confirmButtonText' | 'currentProgressStep'
        | 'customClass' | 'denyButtonAriaLabel' | 'denyButtonColor' | 'denyButtonText'
        | 'didClose' | 'didDestroy' | 'footer' | 'hideClass' | 'html' | 'icon'
        | 'iconColor' | 'imageAlt' | 'imageHeight' | 'imageUrl' | 'imageWidth'
        | 'preConfirm' | 'preDeny' | 'progressSteps' | 'reverseButtons'
        | 'showCancelButton' | 'showCloseButton' | 'showConfirmButton' | 'showDenyButton'
        | 'text' | 'title' | 'titleText' | 'theme' | 'willClose'

    export type DismissReason = 'cancel' | 'backdrop' | 'close' | 'esc' | 'timer'

    export interface SweetAlertCustomClass {
        container?: string | readonly string[]
        popup?: string | readonly string[]
        title?: string | readonly string[]
        closeButton?: string | readonly string[]
        icon?: string | readonly string[]
        image?: string | readonly string[]
        htmlContainer?: string | readonly string[]
        input?: string | readonly string[]
        inputLabel?: string | readonly string[]
        validationMessage?: string | readonly string[]
        actions?: string | readonly string[]
        confirmButton?: string | readonly string[]
        denyButton?: string | readonly string[]
        cancelButton?: string | readonly string[]
        loader?: string | readonly string[]
        footer?: string | readonly string[]
        timerProgressBar?: string | readonly string[]
    }

    export interface SweetAlertResult<T = any> {
        readonly isConfirmed: boolean
        readonly isDenied: boolean
        readonly isDismissed: boolean
        readonly value?: T
        readonly dismiss?: DismissReason
    }

    export type SweetAlertOptions = SweetAlertInputValidator & {
        title?: string | HTMLElement | JQuery
        titleText?: string
        text?: string
        html?: string | HTMLElement | JQuery
        icon?: SweetAlertIcon
        iconColor?: string
        iconHtml?: string
        footer?: string | HTMLElement | JQuery
        template?: string | HTMLTemplateElement
        backdrop?: boolean | string
        toast?: boolean
        draggable?: boolean
        target?: string | HTMLElement | null
        width?: number | string
        padding?: number | string
        color?: string
        background?: string
        position?: SweetAlertPosition
        grow?: SweetAlertGrow
        animation?: boolean
        theme?: SweetAlertTheme
        showClass?: SweetAlertShowClass
        hideClass?: SweetAlertHideClass
        customClass?: SweetAlertCustomClass
        timer?: number
        timerProgressBar?: boolean
        heightAuto?: boolean
        allowOutsideClick?: ValueOrThunk<boolean>
        allowEscapeKey?: ValueOrThunk<boolean>
        allowEnterKey?: ValueOrThunk<boolean>
        stopKeydownPropagation?: boolean
        keydownListenerCapture?: boolean
        showConfirmButton?: boolean
        showDenyButton?: boolean
        showCancelButton?: boolean
        confirmButtonText?: string
        denyButtonText?: string
        cancelButtonText?: string
        confirmButtonColor?: string
        denyButtonColor?: string
        cancelButtonColor?: string
        confirmButtonAriaLabel?: string
        denyButtonAriaLabel?: string
        cancelButtonAriaLabel?: string
        buttonsStyling?: boolean
        reverseButtons?: boolean
        focusConfirm?: boolean
        focusDeny?: boolean
        focusCancel?: boolean
        returnFocus?: boolean
        showCloseButton?: boolean
        closeButtonHtml?: string
        closeButtonAriaLabel?: string
        loaderHtml?: string
        showLoaderOnConfirm?: boolean
        showLoaderOnDeny?: boolean
        preConfirm?(inputValue: any): SyncOrAsync<any>
        preDeny?(value: any): SyncOrAsync<any | void>
        imageUrl?: string | null
        imageWidth?: number | string
        imageHeight?: number | string
        imageAlt?: string
        inputLabel?: string
        inputPlaceholder?: string
        inputValue?: SyncOrAsync<string | number | File | FileList> | null
        inputOptions?: SyncOrAsync<ReadonlyMap<string, string> | Record<string, any>>
        inputAutoFocus?: boolean
        inputAutoTrim?: boolean
        inputAttributes?: Record<string, string>
        returnInputValueOnDeny?: boolean
        validationMessage?: string
        progressSteps?: readonly string[]
        currentProgressStep?: number
        progressStepsDistance?: number | string
        willOpen?(popup: HTMLElement): void
        didOpen?(popup: HTMLElement): void
        didRender?(popup: HTMLElement): void
        willClose?(popup: HTMLElement): void
        didClose?(): void
        didDestroy?(): void
        on?(event: SweetAlertEventName, handler: () => void): void
        once?(event: SweetAlertEventName, handler: () => void): void
        off?(event?: SweetAlertEventName, handler?: () => void): void
        scrollbarPadding?: boolean
        topLayer?: boolean
    }

}

export = Swal;
