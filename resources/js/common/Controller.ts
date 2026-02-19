import ApiService from "@/services/ApiService";
import { AppInstance, ControllerOptions } from "@/types/types";
import { Region } from "./Region";


export class Controller {
    App: AppInstance | null = null;
    currentController: any = null;
    region: Region | any;
    layout: string | null = null;
    router: { [key: string]: any } = {};
    logger: any;
    api?: ApiService | null = null;
    trigger: any;
    props: any;

    constructor(options: ControllerOptions) {
        this.currentController = undefined;
        _.extend(this, options);
    }

    // Backbone Events methods
    listenTo(object: any, event: string, callback: (...args: any[]) => void): void {
        window.Backbone.Events.listenTo.call(this, object, event, callback);
    }

    stopListening(object?: any, event?: string, callback?: (...args: any[]) => void): void {
        window.Backbone.Events.stopListening.call(this, object, event, callback);
    }

    startController(ControllerClass: new (options: ControllerOptions) => any): any {
        if (this.currentController && this.currentController instanceof ControllerClass) {
            return this.currentController;
        }

        if (this.currentController && this.currentController.destroy) {
            this.currentController.destroy();
        }

        this.currentController = new ControllerClass({
            region: this.region,
            api: this.api,
            props: this.props,
            logger: this.logger,
            router: this.router
        });

        _.extend(this.currentController, (Backbone as any).Events);

        return this.currentController;
    }
}
