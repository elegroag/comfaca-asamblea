import useLayout from "@/componentes/useLayout";
import type { BackendAuthProps } from "@/types/types";
import RepresentanteRouter from "./RepresentanteRouter";
import $App from "@/core/App";

interface DashboardComponent {
    props: string[];
    template: string | null;
    isLoading: boolean;
    mount(el: HTMLElement, props: BackendAuthProps): void;
    render(props: BackendAuthProps): string;
}

// Componente Representantes con patrón descentralizado de Habiles
const Representantes: DashboardComponent = {
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
        $App.startApp(RepresentanteRouter, {
            defaultRoute: "listar",
            mainRegion: layout.getRegion('content'),
            props
        });
    }
};

export default Representantes;
