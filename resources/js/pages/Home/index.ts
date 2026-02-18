import { Inertia } from "@inertiajs/inertia";

// Tipos para el componente Home
interface HomeProps {
    title: string;
    items: Array<{
        id: number | string;
        name: string;
        [key: string]: any;
    }>;
}

interface HomeComponent {
    props: string[];
    template: string;
    mounted(): void;
}

// Componente Home con TypeScript
const Home: HomeComponent = {
    props: ["title", "items"],
    template: `
      <div id="app">
        <h1>{{ title }}</h1>
        <ul>
          <li v-for="item in items" :key="item.id">{{ item.name }}</li>
        </ul>
        <button id="refresh">Refresh</button>
      </div>
    `,
    mounted(): void {
        // Aquí mezclamos Vanilla con Vue
        const refreshButton = document.getElementById("refresh");
        if (refreshButton) {
            refreshButton.addEventListener("click", () => {
                // Usamos la API de Inertia para recargar la página
                Inertia.reload();
            });
        }
    },
};

export default Home;