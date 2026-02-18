import { Region } from "@/common/Region";
import LayoutMain from "@/componentes/layouts/views/LayoutMain";
import ViewSidebar from "@/componentes/layouts/views/SidebarView";
import ViewHeader from "@/componentes/layouts/views/HeaderView";
import ViewFooter from "@/componentes/layouts/views/FooterView";
import { BackendAuthProps } from "@/types/types";


export default function useLayout(props: BackendAuthProps) {
    console.log('Dashboard montado');
    const region = new Region({ el: '#contentView' });
    const layout = new LayoutMain();
    region.show(layout);

    const viewSidebar = new ViewSidebar({
        model: {
            menu: props.auth?.menu || [],
            user: props.auth?.user || { name: 'Usuario', email: 'usuario@example.com' }
        }
    });
    const viewHeader = new ViewHeader({ props });
    const viewFooter = new ViewFooter({});

    // Validación segura del layout y sus regiones
    if (layout) {
        const sidebarRegion = layout.getRegion('sidebar');
        const headerRegion = layout.getRegion('header');
        const footerRegion = layout.getRegion('footer');

        if (sidebarRegion) sidebarRegion.show(viewSidebar);
        if (headerRegion) headerRegion.show(viewHeader);
        if (footerRegion) footerRegion.show(viewFooter);
    }

    return {
        layout,
        region,
        viewSidebar,
        viewHeader,
        viewFooter
    };
}
