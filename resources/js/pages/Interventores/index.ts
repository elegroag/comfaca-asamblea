import useLayout from "@/componentes/useLayout";
import type { BackendAuthProps } from "@/types/types";
import RouterInterventor from "./RouterInterventor";
import $App from "@/core/App";

interface DashboardComponent {
    props: string[];
    template: string | null;
    isLoading: boolean;
    mount(el: HTMLElement, props: BackendAuthProps): void;
    render(props: BackendAuthProps): string;
}

// Componente Interventores con patrón descentralizado de Habiles
const Interventores: DashboardComponent = {
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

        // Patrón descentralizado: $App.startApp() como Habiles
        $App.startApp(RouterInterventor, {
            defaultRoute: "listar",
            mainRegion: layout.getRegion('content'),
            props
        });
    }
};

export default Interventores;
