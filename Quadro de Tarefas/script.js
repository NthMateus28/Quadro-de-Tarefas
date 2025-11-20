const columns = document.querySelectorAll(".column__card");
const addTaskButton = document.getElementById("addTaskButton");

let draggedCard;

const dragStart = (event) => {
    draggedCard = event.target;
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
    }
    saveBoard();
};

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
            <div class="card__menu-item">Prioridade</div>
        </div>
    `;

    const cardText = card.querySelector(".card__text");

    cardText.addEventListener("focusout", () => {
        cardText.contentEditable = "false";
        if (!cardText.textContent.trim()) card.remove();
        saveBoard();
    });

    card.addEventListener("dragstart", dragStart);

    card.querySelector(".card__actions").addEventListener("click", (event) => {
        event.stopPropagation();
        const menu = card.querySelector(".card__menu");
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    // Impedir de fechar ao clicar dentro do menu
    card.querySelector(".card__menu").addEventListener("click", (e) => {
        e.stopPropagation();
    });

    card.querySelector(".card__menu-item:nth-child(1)").addEventListener(
        "click",
        () => {
            cardText.contentEditable = "true";
            cardText.focus();
        }
    );

    card.querySelector(".card__menu-item:nth-child(2)").addEventListener(
        "click",
        () => {
            card.remove();
            saveBoard();
        }
    );

    card.querySelector(".card__menu-item:nth-child(3)").addEventListener(
        "click",
        () => {
            setPriority(card);
        }
    );    

    target.append(card);
    cardText.focus();
};

addTaskButton.addEventListener("click", () => {
    const firstColumn = document.querySelector(".column__card");
    createCard(firstColumn);
    saveBoard();
});

columns.forEach((column) => {
    column.addEventListener("dragover", dragOver);
    column.addEventListener("dragenter", dragEnter);
    column.addEventListener("dragleave", dragLeave);
    column.addEventListener("drop", drop);

    // Suporte a toque para dispositivos móveis
    column.addEventListener("touchstart", (event) => {
        draggedCard = event.target.closest(".card");
    });

    column.addEventListener("touchmove", (event) => {
        event.preventDefault();
        const touchLocation = event.targetTouches[0];
        const element = document.elementFromPoint(
            touchLocation.pageX - window.pageXOffset,
            touchLocation.pageY - window.pageYOffset
        );
        if (element && element.closest(".column__card")) {
            element.closest(".column__card").append(draggedCard);
        }
    });
});

function saveBoard() {
    const boardData = [];

    columns.forEach((column, index) => {
        const cards = [...column.querySelectorAll(".card")].map(card => {
            return {
                text: card.querySelector(".card__text").textContent.trim(),
                priority:
                    card.classList.contains("prioridade-alta") ? "alta" :
                    card.classList.contains("prioridade-media") ? "media" :
                    "baixa"
            };            
        });

        boardData[index] = cards;
    });

    localStorage.setItem("kanbanBoard", JSON.stringify(boardData));
}

function loadBoard() {
    const data = JSON.parse(localStorage.getItem("kanbanBoard"));
    if (!data) return;

    data.forEach((cards, index) => {
        const column = columns[index];
        cards.forEach(cardData => {
            const { text, priority } = cardData;        
            const card = document.createElement("section");
            card.className = "card";
            card.draggable = "true";

            card.innerHTML = `
                <div class="card__text" contentEditable="false">${text}</div>
                <span class="card__actions">⋮</span>
                <div class="card__menu">
                    <div class="card__menu-item">Editar</div>
                    <div class="card__menu-item">Excluir</div>
                    <div class="card__menu-item">Prioridade</div>
                </div>
            `;

            // Aplicar prioridade carregada (CORREÇÃO DO UNDEFINED)
            if (priority === "alta") card.classList.add("prioridade-alta");
            if (priority === "media") card.classList.add("prioridade-media");
            if (priority === "baixa") card.classList.add("prioridade-baixa");

            // Eventos do card
            card.addEventListener("dragstart", dragStart);
            card.querySelector(".card__actions").addEventListener("click", (event) => {
                event.stopPropagation();
                const menu = card.querySelector(".card__menu");
                menu.style.display = menu.style.display === "block" ? "none" : "block";
            });

            // Impedir fechar ao clicar dentro do menu
            card.querySelector(".card__menu").addEventListener("click", (e) => {
                e.stopPropagation();
            });

            card.querySelector(".card__menu-item:nth-child(1)").addEventListener(
                "click",
                () => {
                    const cardText = card.querySelector(".card__text");
                    cardText.contentEditable = "true";
                    cardText.focus();
                }
            );

            card.querySelector(".card__menu-item:nth-child(2)").addEventListener(
                "click",
                () => {
                    card.remove();
                    saveBoard();
                }
            );

            card.querySelector(".card__menu-item:nth-child(3)").addEventListener(
                "click",
                () => {
                    setPriority(card);
                }
            );
            

            column.append(card);
        });

        sortColumn(column);
    });
}

function setPriority(card) {
    const level = prompt("Escolha a prioridade: alta, media ou baixa").toLowerCase();

    card.classList.remove("prioridade-alta", "prioridade-media", "prioridade-baixa");

    if (level === "alta") card.classList.add("prioridade-alta");
    else if (level === "media") card.classList.add("prioridade-media");
    else if (level === "baixa") card.classList.add("prioridade-baixa");

    saveBoard();
    sortColumn(card.parentElement);
}

function sortColumn(column) {
    const cards = [...column.querySelectorAll(".card")];

    const priorityValue = card => {
        if (card.classList.contains("prioridade-alta")) return 1;
        if (card.classList.contains("prioridade-media")) return 2;
        return 3; // baixa
    };

    cards.sort((a, b) => priorityValue(a) - priorityValue(b));

    cards.forEach(card => column.append(card));
}

// FECHAR MENU AO CLICAR FORA (AJUSTE FINAL)
document.addEventListener("click", () => {
    document.querySelectorAll(".card__menu").forEach(menu => {
        menu.style.display = "none";
    });
});

loadBoard();
