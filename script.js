const canvas = document.getElementById('tetris');// accedemos al lienzo canvas ----call canvas
const context =canvas.getContext('2d'); //se genera contexto para trabajar sobre el DOM con dos dimensiones ---context 2d

context.scale(20, 20); //genera la escala de las tetrominos---make game tetrominos scale

function arenaSweep() { //Nos permite  eliminar una linea horizontal bien hecha que va dejando limpia la region por donde ya paso
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {//Detecta una colicion entre una figura y otra 
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) // crea la funcion que creara las fichas
{
    if (type === 'I') { // if que crea la figura en forma de i--- create game "tetrominos" like I
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') { // else if que genera la ficha en  forma de L-- create game tokens like L
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') { // else if que genera la ficha en  forma de J------ create game "tetrominos"  like J
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') { // else if que genera la ficha en  forma de cuadrado, se identifica con la o para darle una identidad
        return [ //-- create game "tetrominos"  like square
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {// else if que genera la ficha en  forma de Z----- create game "tetrominos" like Z
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') { // else if que genera la ficha en  forma de S ----- create game "tetrominos"  like S
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') { // else if que genera la ficha en  forma de T ----- create game "tetrominos"  like T
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) { // funcion que recorre la matriz de a ficha y pone y rellena con el color 
    matrix.forEach((row, y) => {      // funcion that iterative in the tetrominos'matrix and put color
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value]; // omite el cero, pero si esta ocupado pone el color
                context.fillRect(x + offset.x,  // compensa las coordenadas para que ciga en el centro
                                 y + offset.y,  // put center to display to tetrominos
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000'; // creacion del contexto y asignacion del estilo --- creation of context-background black 
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) { // funcion que le permite al jugador cambiar la posicion de la ficha-- chance direction of "tetrominos" 
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) { // lo que hace es pasar la columna a fila, y la fila a columna-- chanche columns and rows
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0; //dibuja contador de tiempo, como gotas cayendo----draw count
let dropInterval = 1000; // pone intervalo de 1000(milisegundos) para cada vez que cae un agota---interval 1 second

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime; 
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

const colors = [ // listado de colores para asignar a las "tetrominos" --- list of colors
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

playerReset();
updateScore();
update();
