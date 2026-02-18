
declare global {
    namespace Qs {
        export function parse(str: string, options?: any): any;
        export function stringify(obj: any, options?: any): string;
    }

    const Qs: {
        parse(str: string, options?: any): any;
        stringify(obj: any, options?: any): string;
    };

    type QsStatic = typeof Qs;
}

export { };
