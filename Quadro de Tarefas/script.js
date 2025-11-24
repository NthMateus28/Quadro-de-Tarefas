const columns = document.querySelectorAll(".column__card");
const addTaskButton = document.getElementById("addTaskButton");

let draggedCard;

/* ------------------------- DRAG & DROP ------------------------- */

const dragStart = (event) => {
    draggedCard = event.target.closest(".card");
    event.dataTransfer.effectAllowed = "move";
};

const dragOver = (event) => {
    event.preventDefault();
};

const dragEnter = ({ target }) => {
    if (target.classList.contains("column__card")) {
        target.classList.add("column--highlight");
    }
};

const dragLeave = ({ target }) => {
    target.classList.remove("column--highlight");
};

const drop = ({ target }) => {
    if (target.classList.contains("column__card")) {
        target.classList.remove("column--highlight");
        target.append(draggedCard);
        saveBoard();
    }
};

/* ------------------------- CRIAR CARD ------------------------- */

const createCard = (target) => {
    const card = document.createElement("section");
    card.className = "card";
    card.draggable = "true";

    card.innerHTML = `
        <div class="card__text" contentEditable="true"></div>
        <span class="card__actions">⋮</span>

        <div class="card__menu">
            <div class="card__menu-item">Editar</div>
            <div class="card__menu-item">Excluir</div>

            <div class="card__menu-item prioridade-btn">
                Prioridade →
                <div class="submenu">
                    <div class="submenu-item prioridade-alta">Alta</div>
                    <div class="submenu-item prioridade-media">Média</div>
                    <div class="submenu-item prioridade-baixa">Baixa</div>
                </div>
            </div>
        </div>
    `;

    const cardText = card.querySelector(".card__text");
    cardText.addEventListener("focusout", () => {
        cardText.contentEditable = "false";
        if (!cardText.textContent.trim()) card.remove();
        saveBoard();
    });

    /* ---- MENU PRINCIPAL ---- */
    const menu = card.querySelector(".card__menu");
    const actions = card.querySelector(".card__actions");

    actions.addEventListener("click", (event) => {
        event.stopPropagation();
        closeAllMenus();
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    menu.addEventListener("click", (e) => e.stopPropagation());

    /* ---- AÇÕES DO MENU ---- */

    // Editar
    card.querySelector(".card__menu-item:nth-child(1)").addEventListener("click", () => {
        cardText.contentEditable = "true";
        cardText.focus();
    });

    // Excluir
    card.querySelector(".card__menu-item:nth-child(2)").addEventListener("click", () => {
        card.remove();
        saveBoard();
    });

    // Submenu de prioridade
    card.querySelectorAll(".submenu-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();

            const level =
                item.classList.contains("prioridade-alta") ? "alta" :
                item.classList.contains("prioridade-media") ? "media" :
                "baixa";

            setPriority(card, level);
            menu.style.display = "none";
        });
    });

    card.addEventListener("dragstart", dragStart);

    target.append(card);
    cardText.focus();
};

/* ------------------------- ADICIONAR NOVO CARD ------------------------- */

addTaskButton.addEventListener("click", () => {
    const firstColumn = document.querySelector(".column__card");
    createCard(firstColumn);
    saveBoard();
});

/* ------------------------- EVENTOS DAS COLUNAS ------------------------- */

columns.forEach((column) => {
    column.addEventListener("dragover", dragOver);
    column.addEventListener("dragenter", dragEnter);
    column.addEventListener("dragleave", dragLeave);
    column.addEventListener("drop", drop);
});

/* ------------------------- SALVAR BOARD ------------------------- */

function saveBoard() {
    const boardData = [];

    columns.forEach((column, index) => {
        const cards = [...column.querySelectorAll(".card")].map(card => ({
            text: card.querySelector(".card__text").textContent.trim(),
            priority:
                card.classList.contains("prioridade-alta") ? "alta" :
                card.classList.contains("prioridade-media") ? "media" :
                "baixa"
        }));

        boardData[index] = cards;
    });

    localStorage.setItem("kanbanBoard", JSON.stringify(boardData));
}

/* ------------------------- CARREGAR BOARD ------------------------- */

function loadBoard() {
    const data = JSON.parse(localStorage.getItem("kanbanBoard"));
    if (!data) return;

    data.forEach((cards, index) => {
        const column = columns[index];

        cards.forEach(({ text, priority }) => {
            const card = document.createElement("section");
            card.className = "card";
            card.draggable = "true";

            card.innerHTML = `
                <div class="card__text" contentEditable="false">${text}</div>
                <span class="card__actions">⋮</span>

                <div class="card__menu">
                    <div class="card__menu-item">Editar</div>
                    <div class="card__menu-item">Excluir</div>

                    <div class="card__menu-item prioridade-btn">
                        Prioridade →
                        <div class="submenu">
                            <div class="submenu-item prioridade-alta">Alta</div>
                            <div class="submenu-item prioridade-media">Média</div>
                            <div class="submenu-item prioridade-baixa">Baixa</div>
                        </div>
                    </div>
                </div>
            `;

            // Aplicar prioridade salva
            if (priority === "alta") card.classList.add("prioridade-alta");
            if (priority === "media") card.classList.add("prioridade-media");
            if (priority === "baixa") card.classList.add("prioridade-baixa");

            /* ---- RECRIAR EVENTOS ---- */

            const cardText = card.querySelector(".card__text");
            card.addEventListener("dragstart", dragStart);

            const menu = card.querySelector(".card__menu");
            const actions = card.querySelector(".card__actions");

            actions.addEventListener("click", (event) => {
                event.stopPropagation();
                closeAllMenus();
                menu.style.display = menu.style.display === "block" ? "none" : "block";
            });

            menu.addEventListener("click", (e) => e.stopPropagation());

            card.querySelector(".card__menu-item:nth-child(1)").addEventListener("click", () => {
                cardText.contentEditable = "true";
                cardText.focus();
            });

            card.querySelector(".card__menu-item:nth-child(2)").addEventListener("click", () => {
                card.remove();
                saveBoard();
            });

            card.querySelectorAll(".submenu-item").forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const level =
                        item.classList.contains("prioridade-alta") ? "alta" :
                        item.classList.contains("prioridade-media") ? "media" :
                        "baixa";
                    setPriority(card, level);
                    menu.style.display = "none";
                });
            });

            column.append(card);
        });

        sortColumn(column);
    });
}

/* ------------------------- APLICAR PRIORIDADE ------------------------- */

function setPriority(card, level) {
    card.classList.remove("prioridade-alta", "prioridade-media", "prioridade-baixa");

    if (level === "alta") card.classList.add("prioridade-alta");
    if (level === "media") card.classList.add("prioridade-media");
    if (level === "baixa") card.classList.add("prioridade-baixa");

    saveBoard();
    sortColumn(card.parentElement);
}

/* ------------------------- ORDENAR ------------------------- */

function sortColumn(column) {
    const cards = [...column.querySelectorAll(".card")];

    const priorityValue = card =>
        card.classList.contains("prioridade-alta") ? 1 :
        card.classList.contains("prioridade-media") ? 2 :
        3;

    cards.sort((a, b) => priorityValue(a) - priorityValue(b))
         .forEach(card => column.append(card));
}

/* ------------------------- FECHAR MENUS ------------------------- */

function closeAllMenus() {
    document.querySelectorAll(".card__menu").forEach(menu => {
        menu.style.display = "none";
    });
}

document.addEventListener("click", closeAllMenus);

/* ------------------------- INICIAR ------------------------- */
loadBoard();
