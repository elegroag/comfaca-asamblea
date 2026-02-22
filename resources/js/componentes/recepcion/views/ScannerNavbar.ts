import { BackboneView } from "@/common/Bone";
import navbar from "@/componentes/recepcion/templates/navbar.hbs?raw";

interface ScannerNavbarOptions {
    model?: any;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class ScannerNavbar extends BackboneView {
    template: any;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;

    constructor(options: ScannerNavbarOptions) {
        super({
            ...options,
            className: 'nav',
            id: 'ul_sidebar',
            tagName: 'ul',
        });
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(navbar);
    }

    events() {
        return {
            'click a': 'module_navegation',
        };
    }

    module_navegation(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        const href = target.attr('data-href');
        if (href) {
            if (this.app && this.app.router) {
                this.app.router.navigate(href, { trigger: true });
            } else {
                // Fallback a window.location si no hay router
                window.location.href = href;
            }
        }
    }

    inload(scope: ScannerNavbar) {
        // Usar DOM nativo en lugar de jQuery
        const sidebarNav = document.querySelector('.sidebar-wrapper .nav');
        if (sidebarNav) {
            const navItems = sidebarNav.querySelectorAll('li');
            navItems.forEach(item => item.classList.remove('active'));
        }

        const targetItem = this.$el.find(`li[data-toggle-nav='${scope.model.item}'] a`);
        if (targetItem.length > 0) {
            targetItem.trigger('click');
        }
    }

    render() {
        const template = _.template(this.template);
        this.$el.html(template());
        this.inload(this);
        return this;
    }
}
