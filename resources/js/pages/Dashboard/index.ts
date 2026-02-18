import DashboardView from "@/componentes/dashboard/views/DashboardView";
import useLayout from "@/componentes/useLayout";
import type { BackendAuthProps } from "@/types/types";

interface DashboardComponent {
    props: string[];
    template: string | null;
    isLoading: boolean;
    mount(el: HTMLElement, props: BackendAuthProps): void;
    render(props: BackendAuthProps): string;
}

// Componente Dashboard con TypeScript
const Dashboard: DashboardComponent = {
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

        if (layout) {
            const viewContent = new DashboardView({ props });
            const contentRegion = layout.getRegion('content');
            if (contentRegion) contentRegion.show(viewContent);
        }

    }
};

export default Dashboard;
