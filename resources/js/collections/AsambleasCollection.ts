import { BackboneCollection } from "@/common/Bone";
import Asamblea from "@/models/Asamblea";
import { route } from "ziggy-js";

class AsambleasCollection extends BackboneCollection {
    constructor(options: any) {
        super({ ...options, url: route('admin.all') });
    }

    get model() {
        return Asamblea;
    }
}
export default AsambleasCollection;
