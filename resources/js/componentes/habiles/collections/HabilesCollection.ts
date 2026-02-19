import { BackboneCollection } from "@/common/Bone";
import HabilModel from "../models/HabilModel";

declare global {
    var $: any;
    var _: any;
    var $App: any;
}

interface HabilesCollectionOptions {
    models?: any[];
    comparator?: string | ((model: any) => any);
}

export default class HabilesCollection extends BackboneCollection {
    url: string;

    constructor(options: HabilesCollectionOptions = {}) {
        super({ ...options });
        this.url = '/web/habil/listar';
    }

    get model(): typeof HabilModel {
        return HabilModel;
    }
}
