import useLayout from "@/componentes/useLayout";
import $App from "@/core/App";
import type { BackendAuthProps } from "@/types/types";
import RouterTrabajador from "./RouterTrabajador";

interface DashboardComponent {
    props: string[];
    template: string | null;
    isLoading: boolean;
    mount(el: HTMLElement, props: BackendAuthProps): void;
    render(props: BackendAuthProps): string;
}

// Componente Dashboard con TypeScript
const Trabajadores: DashboardComponent = {
    props: ["title", "user", "stats"],
    template: null,
    isLoading: false,

    render(props: BackendAuthProps): string {
        return "<div class='w-full h-full bg-gray-50 font-sans' id='contentView'></div>";
    },

    mount(el: HTMLElement, props: BackendAuthProps): void {
        const {
            layout,
            region,
            viewSidebar,
            viewHeader,
            viewFooter
        } = useLayout(props);

        $App.startApp(RouterTrabajador, {
            defaultRoute: "listar",
            mainRegion: layout.getRegion('content'),
            props
        });
    }
};

export default Trabajadores;
