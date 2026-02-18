
class Utils {

    static getURL(url: string = ''): string {
        const csrfTag = document.querySelector<HTMLInputElement>('[name="csrf-token"]');
        return csrfTag?.getAttribute('path') + url;
    }

    static numberFormat(
        number: number = 0,
        decimals: number = 0,
        dec_point?: string,
        thousands_sep?: string
    ): string {
        const n = !isFinite(+number) ? 0 : +number;
        const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
        const sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep;
        const dec = typeof dec_point === 'undefined' ? '.' : dec_point;
        let s: string[] | undefined;

        const toFixedFix = (n: number, prec: number): string => {
            const k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };

        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    }

    static validOnlyLetter(evt: KeyboardEvent): void {
        const kc = evt.keyCode;
        const ev = (kc >= 65 && kc <= 90) || kc === 8 || kc === 9 || kc === 32;
        if (ev === false) {
            evt.preventDefault();
            evt.stopPropagation();
            (evt as any).stopped = true;
        }
    }
}

class Messages {
    static display(message: string, type: string, timeout: number = 8000): void {
        new window.Noty({
            text: message,
            layout: 'topRight',
            theme: 'relax',
            type: type,
            timeout: timeout,
        }).show();
    }
}

const StringUtils = {
    /**
     * Capitaliza la primera letra de una cadena
     */
    capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Convierte una cadena a snake_case
     */
    snakeCase(str: string): string {
        return str.replace(/([A-Z])/g, '_$1').toLowerCase();
    },

    /**
     * Convierte una cadena a camelCase
     */
    camelCase(str: string): string {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    },

    /**
     * Trunca una cadena y añade ellipsis
     */
    truncate(str: string, length: number = 50, suffix: string = '...'): string {
        if (str.length <= length) return str;
        return str.slice(0, length - suffix.length) + suffix;
    }
};

const NumberUtils = {
    /**
     * Formatea un número con decimales
     */
    format(num: number, decimals: number = 2): string {
        return num.toFixed(decimals);
    },

    /**
     * Formatea un número como moneda
     */
    currency(num: number, symbol: string = '$'): string {
        return `${symbol}${num.toFixed(2)}`;
    },

    /**
     * Convierte un número a porcentaje
     */
    percentage(num: number, decimals: number = 1): string {
        return `${(num * 100).toFixed(decimals)}%`;
    }
};

const FormUtils = {
    /**
     * Serializa un formulario a objeto
     */
    serializeForm($form: JQueryStatic): Record<string, any> {
        const result: Record<string, any> = {};
        $form.serializeArray().forEach((item) => {
            result[item.name] = item.value;
        });
        return result;
    },

    /**
     * Limpia los campos de un formulario
     */
    clearForm($form: any): void {
        const formElement = $form[0] as HTMLFormElement;
        if (formElement && formElement.reset) {
            formElement.reset();
        }
        $form.find('input, textarea, select').val('');
    },

    /**
     * Valida un email
     */
    validateEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
};

const DOMUtils = {
    /**
     * Espera a que el DOM esté listo
     */
    ready(callback: () => void): void {
        $(callback);
    },

    /**
     * Crea un elemento con atributos
     */
    createElement(tag: string, attributes: Record<string, string> = {}, content: string = ''): HTMLElement {
        const el = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            el.setAttribute(key, value);
        });
        if (content) {
            el.innerHTML = content;
        }
        return el;
    },

    /**
     * Animación de fade in
     */
    fadeIn($el: JQueryStatic, duration: number = 300): Promise<void> {
        return new Promise((resolve) => {
            $el.fadeIn(duration, resolve);
        });
    },

    /**
     * Animación de fade out
     */
    fadeOut($el: JQueryStatic, duration: number = 300): Promise<void> {
        return new Promise((resolve) => {
            $el.fadeOut(duration, resolve);
        });
    }
};

const langDataTable = {
    processing: 'Procesando...',
    lengthMenu: 'Mostrar _MENU_ resultados por pagínas',
    zeroRecords: 'No se encontraron resultados',
    info: 'Mostrando pagína _PAGE_ de _PAGES_.\tTotal de _TOTAL_ registros.',
    infoEmpty: 'No records available',
    infoFiltered: '(filtered from _MAX_ total records)',
    emptyTable: 'Ningún dato disponible en esta tabla',
    search: 'Buscar',
    paginate: {
        next: 'siguiente',
        previus: 'anterior',
        first: 'primero',
        last: 'ultimo',
    },
    loadingRecords: 'Cargando...',
    buttons: {
        copy: 'Copiar',
        colvis: 'Visibilidad',
        collection: 'Colección',
        colvisRestore: 'Restaurar visibilidad',
        copyKeys:
            'Presione ctrl o u2318 + C para copiar los datos de la tabla al portapapeles del sistema. <br /> <br /> Para cancelar, haga clic en este mensaje o presione escape.',
        copySuccess: {
            1: 'Copiada 1 fila al portapapeles',
            _: 'Copiadas %d fila al portapapeles',
        },
    },
};

const capitalize = (_string: string) => {
    if (typeof _string !== 'string') return '';
    const exp = _string.toLowerCase().split(' ');
    if (exp.length == 1) {
        _string = exp[0].charAt(0).toUpperCase() + exp[0].slice(1);
    }
    if (exp.length > 1) {
        const parts = new Array();
        _.each(exp, (parte: string) => {
            parts.push(parte.charAt(0).toUpperCase() + parte.slice(1));
        });
        _string = parts.join(' ');
    }
    return _string;
};

const handleFiles = (): boolean => {
    const fileInput = document.querySelector<HTMLInputElement>("[data-event='upload']");
    if (!fileInput?.files?.length) return false;

    const allowedExtensions = /(\.csv|\.text|\.txt)$/i;
    const filePath = fileInput.files[0].name;

    if (!allowedExtensions.exec(filePath)) {
        const nameArchivo = document.querySelector<HTMLInputElement>('#name_archivo');
        const removerArchivo = document.querySelector<HTMLButtonElement>('#remover_archivo');
        const btHacerCargue = document.querySelector<HTMLButtonElement>('#bt_hacer_cargue');

        if (nameArchivo) nameArchivo.textContent = '';
        if (removerArchivo) removerArchivo.setAttribute('disabled', 'true');
        if (btHacerCargue) btHacerCargue.setAttribute('disabled', 'true');

        alert('Please upload file having extensions .csv/.text/.txt only.');
        fileInput.value = '';
        return false;
    } else {
        if (fileInput.files && fileInput.files[0]) {
            const exp = filePath.split('_');
            const formattedPath = exp.join('\r');
            const nameArchivo = document.querySelector<HTMLInputElement>('#name_archivo');
            const removerArchivo = document.querySelector<HTMLButtonElement>('#remover_archivo');
            const btHacerCargue = document.querySelector<HTMLButtonElement>('#bt_hacer_cargue');

            if (nameArchivo) nameArchivo.textContent = formattedPath;
            if (removerArchivo) removerArchivo.removeAttribute('disabled');
            if (btHacerCargue) btHacerCargue.removeAttribute('disabled');
        }
    }
    return true;
};

export {
    Messages,
    Utils,
    StringUtils,
    NumberUtils,
    FormUtils,
    DOMUtils,
    langDataTable,
    capitalize,
    handleFiles
};
