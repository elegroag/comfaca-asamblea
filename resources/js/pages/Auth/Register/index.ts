import layoutAuth from '@/componentes/layouts/templates/layout-auth.hbs?raw';
import * as _ from 'underscore';
import $App from "@/core/App";
import RouterRegister from "./RouterRegister";

// Componente TypeScript para Inertia - Auth Register
interface RegisterProps {
    errors?: Record<string, string>;
    old?: Record<string, string>;
    [key: string]: any;
}

interface RegisterComponent {
    render(props: RegisterProps): string;
    mount(el: HTMLElement, props: RegisterProps): void;
}

const Register: RegisterComponent = {
    render(props: RegisterProps): string {
        const template = _.template(layoutAuth);
        return template({ props });
    },

    mount(el: HTMLElement, props: RegisterProps): void {
        $App.startApp(RouterRegister, { defaultRoute: "register", el: "#auth-content" }, props);
    }
};

export default Register;
