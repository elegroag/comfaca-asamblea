import layoutAuth from '@/componentes/layouts/templates/layout-auth.hbs?raw';
import * as _ from 'underscore';
import $App from "@/core/App";
import RouterRegister from "./RouterRegister";
import { Region } from '@/common/Region';
import LayoutAuth from '@/componentes/layouts/views/LayoutAuth';

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

        const region = new Region({ el: '#contentView' });
        const layout = new LayoutAuth();
        region.show(layout);

        $App.startApp(RouterRegister, {
            defaultRoute: "register",
            mainRegion: layout.getRegion('content'),
            props
        });
    }
};

export default Register;
