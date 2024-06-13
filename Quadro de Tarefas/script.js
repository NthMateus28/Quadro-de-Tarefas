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
        </div>
    `;

    const cardText = card.querySelector(".card__text");

    cardText.addEventListener("focusout", () => {
        cardText.contentEditable = "false";
        if (!cardText.textContent.trim()) card.remove();
    });

    card.addEventListener("dragstart", dragStart);

    card.querySelector(".card__actions").addEventListener("click", (event) => {
        event.stopPropagation();
        const menu = card.querySelector(".card__menu");
        menu.style.display = menu.style.display === "block" ? "none" : "block";
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
        }
    );

    target.append(card);
    cardText.focus();
};

addTaskButton.addEventListener("click", () => {
    const firstColumn = document.querySelector(".column__card");
    createCard(firstColumn);
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
