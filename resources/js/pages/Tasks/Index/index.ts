import useLayout from "@/componentes/useLayout";
import TasksView from "@/componentes/tasks/views/TasksView";
import type { BackendAuthProps } from "@/types/types";

interface TasksIndexComponent {
    props: string[];
    template: string | null;
    isLoading: boolean;
    render(props: BackendAuthProps): string;
    mount(el: HTMLElement, props: BackendAuthProps): void;
}

const TasksIndex: TasksIndexComponent = {
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

        if (layout) {
            const viewContent = new TasksView({ props });
            const contentRegion = layout.getRegion('content');
            if (contentRegion) contentRegion.show(viewContent);
        }
    },
};

export default TasksIndex;
