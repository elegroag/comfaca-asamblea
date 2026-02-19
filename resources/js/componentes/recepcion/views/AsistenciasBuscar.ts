import { BackboneView } from "@/common/Bone";

interface AsistenciasBuscarOptions {
    collection?: any[];
    App?: any;
    [key: string]: any;
}

export default class AsistenciasBuscar extends BackboneView {
    template!: string;
    App: any;
    collection: any[];

    constructor(options: AsistenciasBuscarOptions = {}) {
        super(options);
        this.App = options.App;
        this.collection = options.collection || [];
    }

    initialize() {
        this.template = $('#tmp_asistencias_buscar').html();
    }

    render() {
        const template = _.template(this.template);
        this.$el.html(template());
        if (_.size(this.collection) > 0) {
            const strs = this.collection.map((model: any) => {
                return model.cedrep + ' ' + model.empleador;
            });

            this.$el.find('#cedrep').typeahead(
                {
                    hint: false,
                    highlight: true,
                    minLength: 1,
                },
                {
                    name: 'states',
                    source: this.substringMatcher(strs),
                }
            );
        }
        return this;
    }

    substringMatcher(strs: string[]) {
        return function findMatches(q: string, cb: (matches: string[]) => void) {
            let matches: string[] = [];
            const substrRegex = new RegExp(q, 'i');

            _.each(strs, (str: string) => {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });
            cb(matches);
        };
    }

    events() {
        return {
            'click #bt_buscar_asistente': 'buscarAsistente',
            'click #bt_usar_scanner': 'usarScanner',
            "keypress [name='cedrep']": 'keyBuscarCedrep',
        };
    }

    usarScanner(e: JQuery.Event) {
        e.preventDefault();
        this.$el.find(e.currentTarget).attr('disabled', true);
        window.location.href = create_url('recepcion/buscando#buscar');
    }

    noevent(e: JQuery.Event) {
        e.preventDefault();
        return false;
    }

    keyBuscarCedrep(e: JQuery.Event) {
        const code = e.keyCode || e.which;
        if (code == 13) this.$el.find('#bt_buscar_asistente').trigger('click');
    }

    buscarAsistente(e: JQuery.Event) {
        e.preventDefault();
        var target = this.$el.find(e.currentTarget);
        const stCedrep = this.getInput('cedrep');

        if (stCedrep == '' || stCedrep == undefined || stCedrep.trim() == '') {
            $App.trigger('alert:error', 'El documento no es valido para mostrar los datos del representante.');
            return false;
        }

        const splits = stCedrep.split(/(\s+)/);
        const cedrep = splits[0];

        if (!/^([0-9]+){5,20}(.*)?$/.test(cedrep)) {
            $App.trigger('alert:error', 'El documento no es valido para mostrar los datos del representante.');
            return false;
        }

        target.attr('disabled', true);

        this.trigger('search:cedrep', {
            cedrep,
            callback: (response: any) => {
                target.removeAttr('disabled');
                if (response) {
                    this.trigger('add:representante', response.representante);
                    this.trigger('set:asistencias', response.asistente);
                    this.trigger('set:empresas', response.empresas);
                    this.trigger('show:item', response);
                    $App.router.navigate('mostrar/' + cedrep, { trigger: true, replace: true });
                }
            },
        });
    }

    getInput(selector: string): string {
        return this.$el.find(`[name='${selector}']`).val();
    }

    setInput(selector: string, val: string | undefined) {
        return this.$el.find(`[name='${selector}']`).val(val ?? '');
    }
}
