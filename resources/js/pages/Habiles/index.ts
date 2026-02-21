import useLayout from "@/componentes/useLayout";
import $App from "@/core/App";
import type { BackendAuthProps } from "@/types/types";
import RouterHabiles from "./RouterHabiles";
import { DashboardComponent } from "./types";

const Habiles: DashboardComponent = {
    props: ["title", "user", "stats"],
    template: null,
    isLoading: false,

    render(): string {
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

        $App.startApp(RouterHabiles, {
            defaultRoute: "listar",
            mainRegion: layout.getRegion('content'),
            props
        });
    }
};

export default Habiles;
