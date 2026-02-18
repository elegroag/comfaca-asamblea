import { Region } from '@/common/Region';
import Loading from '@/common/Loading';
import ApiService from '@/services/ApiService';
import {
    SubApplicationOptions,
    SyncroRequest,
    ModalTransfer,
    ConfirmTransfer,
    AlertTransfer,
    DownloadTransfer,
    UploadTransfer,
    RegionOptions,
    AppInstance
} from '@/types/types';

import Logger from '@/common/Logger';

const $App: AppInstance = {
    Models: {},
    Collections: {},
    router: null,
    currentSubapp: null,
    Modal: null,
    layout: null,
    el: null,
    mainRegion: null,
    props: null,

    startApp(RouterModule: new () => any, options: { defaultRoute: string; el: string; }, props?: any): void {
        this.props = props;
        this.el = options.el;

        const _router = new RouterModule();
        if (!Backbone.history.start()) {
            _router.navigate(options.defaultRoute, { trigger: true });
        }
    },

    notify(type: string, message: string): void {
        this.showNoty(type, message.toString(), type === 'error' ? 10000 : 6000);
    },

    alert(type: string, transfer: AlertTransfer): void {
        const { title = 'Notificación', message = 'Nota no hay respuesta de la solicitud', timer = 8200 } = transfer;
        this.showAlert(title, message, type, timer);
    },

    showNoty(type: string, message: string, timeout: number): void {
        new window.Noty({
            text: message,
            layout: 'topRight',
            theme: 'relax',
            type: type,
            timeout: timeout,
        }).show();
    },

    showAlert(title: string = '', text: string = '', icon: string = '', timer: number): void {
        Swal.fire(<SweetAlertOptions>{
            title,
            html: text,
            icon,
            showConfirmButton: false,
            confirmButtonText: 'Continuar',
            timer,
        });
    },

    startSubApplication(
        SubApplication: new (options: SubApplicationOptions) => any,
        router
    ): any {

        this.mainRegion = new Region({ el: this.el } as RegionOptions);
        this.currentSubapp = new SubApplication({
            region: this.mainRegion,
            api: new ApiService(this.props),
            props: this.props,
            logger: new Logger(),
            router: router
        });

        _.extend(this.currentSubapp, (Backbone as any).Events);

        const alertTypes = ['error', 'warning', 'success', 'info'];

        alertTypes.forEach((type) => {
            this.listenTo(this.currentSubapp, `noty:${type}`, (message: string) => this.notify(type, message));
            this.listenTo(this.currentSubapp, `alert:${type}`, (transfer: AlertTransfer) => this.alert(type, transfer));
        });

        this.listenTo(this.currentSubapp, 'confirma', this.confirmaApp);
        this.listenTo(this.currentSubapp, 'syncro', this.syncroRequest);
        this.listenTo(this.currentSubapp, 'ajax', this.ajaxKumbia);
        this.listenTo(this.currentSubapp, 'show:modal', this.renderModal);
        this.listenTo(this.currentSubapp, 'hide:modal', this.closeModal);
        this.listenTo(this.currentSubapp, 'down', this.downLoadFile);
        this.listenTo(this.currentSubapp, 'upload', this.uploadFile);
        this.listenTo(this.currentSubapp, 'notify', this.notify);
        return this.currentSubapp;
    },

    confirmaApp(transfer: ConfirmTransfer): void {
        const { message, callback, title = '¿Confirmar?', icon = 'warning' } = transfer;
        Swal.fire(<SweetAlertOptions>{
            title: title,
            text: message,
            icon: icon,
            showCancelButton: true,
            confirmButtonColor: '#2dce89',
            cancelButtonColor: '#fc8c72',
            confirmButtonText: 'SI, Continuar!',
        }).then((result: any) => {
            callback(result.isConfirmed);
        });
    },

    syncroRequest(transfer: SyncroRequest): void {
        const { url, data = {}, callback, silent = false } = transfer;
        const csrf = document.querySelector("[name='csrf-token']")?.getAttribute('content') || '';

        Backbone.ajax({
            type: 'POST',
            dataType: 'json',
            url: url,
            data: data,
            cache: false,
            contentType: 'application/x-www-form-urlencoded',
            processData: true,
            timeout: 52400,
            beforeSend: (xhr: any) => {
                if (silent === false) Loading.show();
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                if (csrf.length > 0) {
                    xhr.setRequestHeader('X-CSRF-TOKEN', csrf);
                    xhr.setRequestHeader('Authorization', 'Bearer ' + csrf);
                }
            },
            success: (response: any, textStatus: string, xhr: any) => {
                if (silent === false) Loading.hide();
                console.log('Status Text:', textStatus);
                console.log('HTTP Status Code:', xhr.status);
                if (xhr.status >= 200 && xhr.status <= 210) {
                    return callback(response);
                } else {
                    throw new Error('Error ' + textStatus);
                }
            },
            error: (xhr: any, textStatus: string, errorThrown: any) => {
                if (silent === false) Loading.hide();
                console.log('Status Text:', textStatus);
                console.log('HTTP Status Code:', xhr.status);
                console.log('Response Text:', xhr.responseText);
                if (xhr.status > 210) {
                    this.trigger('alert:error', { message: xhr.responseText });
                } else {
                    this.trigger('alert:error', { message: errorThrown });
                }
                return callback(false);
            },
        });
    },

    renderModal(transfer: ModalTransfer): void {
    },

    closeModal(view?: any): void {
    },

    ajaxKumbia(transfer: Partial<SyncroRequest> = {}): void {
        const { url, data = {}, callback, silent = false } = transfer;
        const csrf = document.querySelector("[name='csrf-token']")?.getAttribute('content') || '';

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: url,
            data: Qs.stringify(data),
            processData: false,
            contentType: 'application/x-www-form-urlencoded',
            cache: false,
            beforeSend: (xhr: any) => {
                if (silent === false) Loading.show();
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                if (csrf.length > 0) {
                    xhr.setRequestHeader('X-CSRF-TOKEN', csrf);
                    xhr.setRequestHeader('Authorization', 'Bearer ' + csrf);
                }
            },
        })
            .done((response: any, textStatus: string, xhr: any) => {
                if (silent === false) Loading.hide();
                if (xhr.status >= 200 && xhr.status <= 210) {
                    return callback?.(response);
                } else {
                    throw new Error('Error ' + textStatus);
                }
            })
            .fail((err: any) => {
                if (silent === false) Loading.hide();
                this.trigger('alert:error', { message: err.responseText });
                return callback?.(false);
            })
            .always(() => {
                if (silent === false) Loading.hide();
            });
    },

    downLoadFile(transfer: DownloadTransfer): void {
        const { url, filename } = transfer;
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        console.log(link);
        link.click();
    },

    uploadFile(transfer: UploadTransfer): void {
        const { url, data, callback, silent = false } = transfer;
        let formData: FormData;

        if (data instanceof FormData) {
            formData = data;
        } else {
            formData = new FormData();
            formData.append(data.name, data.file);
        }
        const csrf = document.querySelector("[name='csrf-token']")?.getAttribute('content') || '';
        Backbone.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: (xhr: JQuery.JQueryXHR) => {
                if (silent === false) Loading.show();
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                if (csrf.length > 0) {
                    xhr.setRequestHeader('X-CSRF-TOKEN', csrf);
                    xhr.setRequestHeader('Authorization', 'Bearer ' + csrf);
                }
            },
            success: (response: any) => {
                if (silent === false) Loading.hide();
                return callback(response);
            },
            error: (err: any) => {
                const keys = Object.keys(err);
                console.log(err);
                if (silent === false) Loading.hide();
                if (window._.indexOf(keys, 'responseText') !== -1) {
                    this.trigger('alert:error', { message: err.responseText });
                } else {
                    this.trigger('alert:error', { message: 'Error al subir archivo' });
                }
                return callback(false);
            },
        });
    },

    // Alias methods for backward compatibility
    confirma: function (transfer: ConfirmTransfer): void {
        return this.confirmaApp(transfer);
    },
    syncro: function (transfer: SyncroRequest): void {
        return this.syncroRequest(transfer);
    },
    ajax: function (transfer: any): void {
        return this.ajaxKumbia(transfer);
    },
    show_modal: function (transfer: ModalTransfer): void {
        return this.renderModal(transfer);
    },
    hide_modal: function (): void {
        return this.closeModal();
    },
    download: function (transfer: DownloadTransfer): void {
        return this.downLoadFile(transfer);
    },
    upload: function (transfer: UploadTransfer): void {
        return this.uploadFile(transfer);
    },
    // Backbone Events methods
    listenTo: function (object: any, event: string, callback: (...args: any[]) => void): void {
        window.Backbone.Events.listenTo.call(this, object, event, callback);
    },

    trigger: function (event: string, ...args: any[]): void {
        window.Backbone.Events.trigger.apply(this, [event, ...args]);
    }
};


export default $App;
