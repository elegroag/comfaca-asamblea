import layoutAuth from '@/componentes/layouts/templates/layout-auth.hbs?raw';
import * as _ from 'underscore';
import $App from "@/core/App";
import RouterLogin from "./RouterLogin";
import { Region } from '@/common/Region';
import LayoutAuth from '@/componentes/layouts/views/LayoutAuth';

// Componente TypeScript para Inertia - Auth Login
interface LoginProps {
    errors?: Record<string, string>;
    old?: Record<string, string>;
    [key: string]: any;
}

interface LoginComponent {
    render(props: LoginProps): string;
    mount(el: HTMLElement, props: LoginProps): void;
}

const Login: LoginComponent = {
    render(props: LoginProps): string {
        const template = _.template(layoutAuth);
        return template({ props });
    },

    mount(el: HTMLElement, props: LoginProps): void {

        const region = new Region({ el: '#contentView' });
        const layout = new LayoutAuth();
        region.show(layout);

        $App.startApp(RouterLogin, {
            defaultRoute: "login",
            mainRegion: layout.getRegion('content'),
            props
        });
    },
};

export default Login;
