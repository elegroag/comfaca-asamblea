import { BackboneView } from "@/common/Bone";
import tmp_sub_navbar from "@/templates/recepcion/sub_navbar.hbs?raw";

interface AsistenciasNavbarOptions {
    model?: any;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsistenciasNavbar extends BackboneView {
    template: any;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;

    constructor(options: AsistenciasNavbarOptions = {}) {
        super({ ...options, className: 'nav', id: 'ul_sidebar', tagName: 'ul' });
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(tmp_sub_navbar);
    }

    events() {
        return {
            'click a': 'module_navegation',
        };
    }

    module_navegation(e: Event) {
        e.preventDefault();
        const href = this.$el.find(e.currentTarget).attr('data-href');
        if (href) {
            if (this.app && this.app.router) {
                this.app.router.navigate(href, { trigger: true });
            }
        }
    }

    inload(scope: AsistenciasNavbar) {
        // Usar DOM nativo en lugar de jQuery
        const sidebarNav = document.querySelector('.sidebar-wrapper .nav');
        if (sidebarNav) {
            const navItems = sidebarNav.querySelectorAll('li');
            navItems.forEach(item => item.classList.remove('active'));
        }

        const targetItem = document.querySelector(`li[data-toggle-nav='${scope.model.item}'] a`) as HTMLElement;
        if (targetItem) {
            targetItem.click();
        }
    }

    render() {
        const template = _.template(this.template);
        this.$el.html(template());
        this.inload(this);
        return this;
    }
}
