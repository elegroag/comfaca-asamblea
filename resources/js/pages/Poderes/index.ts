import useLayout from "@/componentes/useLayout";
import type { BackendAuthProps } from "@/types/types";
import RouterPoderes from "./RouterPoderes";
import $App from "@/core/App";

interface DashboardComponent {
    props: string[];
    template: string | null;
    isLoading: boolean;
    mount(el: HTMLElement, props: BackendAuthProps): void;
    render(props: BackendAuthProps): string;
}

// Componente Poderes con patrón descentralizado de Habiles
const Poderes: DashboardComponent = {
    props: ["title", "user", "stats"],
    template: null,
    isLoading: false,

    render(props: BackendAuthProps): string {
        return "<div class='w-100 h-100 bg-gray-light font-weight-normal' id='contentView'></div>";
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
        $App.startApp(RouterPoderes, {
            defaultRoute: "listar",
            mainRegion: layout.getRegion('content'),
            props
        });
    }
};

export default Poderes;
