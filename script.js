const canvas = document.getElementById('tetris');// accedemos al lienzo canvas ----call canvas
const context =canvas.getContext('2d'); //se genera contexto para trabajar sobre el DOM con dos dimensiones ---context 2d

context.scale(20, 20); //genera la escala de las tetrominos---make game tetrominos scale

function arenaSweep() { //Nos permite  eliminar una linea horizontal bien hecha que va dejando limpia la region por donde ya paso
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) { // si la line se llen, sin dejar un solo espacio esta se suprime toda
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;// si no, debe contuniar el llenado
            }
        }

        const row = arena.splice(y, 1)[0].fill(0); //se realiza el empalme de las fichas consecutivas horizontales y las suprime
        arena.unshift(row); // la fila queda vacia, y se llena dejando desplazar la fila que esta encima
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
    return false; // si no detecta colicion segura desdenciendo hasta que encuentre donde colisionar
}

function createMatrix(w, h) { // se crean dos matrices vacias por donde va a desplazarse hacia abajo creando otra matriz que la empuja
    const matrix = [];
    while (h--) { // se recorrera con un while para establecer los puntos que estan ocupados
        matrix.push(new Array(w).fill(0)); // empujara una nueva matriz desplazando a la que viene ocupada
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
                                 y + offset.y,  // compensa las coordenadas por donde pasa para que no se alargue el tetrominos, sino que se vaya borrando por donde pasa
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000'; // creacion del contexto y asignacion del estilo --- creation of context-background black 
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0}); // se esatblece la matriz de arena para diferenciarla del usuario
    drawMatrix(player.matrix, player.pos);//se establece la matriz de la posicion del usuario
}                              // en este punto se logra que las fichas se apilen

function merge(arena, player) { //funcion que busca fundir las piezas para que se unan sin sobrepasarse ni ponerse una sobre la otra
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

    if (dir > 0) { // si la direccion es mayor a cero, es decir ira en sentido de las manecillas del reloj con el codigo de la letra W
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse(); // si no ira en contra de las manecillas del reloj, es decir la letra Q
    }
}

function playerDrop() { // funcion que permite al usuario cambiar de direccion de la ficha, sin que siga mas de una orden a la vez
    player.pos.y++;
    if (collide(arena, player)) { // si la ficha colisiona o llega a la arena esta se fusionara con la arena, y la zona de juego se vera disminuida
        player.pos.y--;
        merge(arena, player);
        playerReset(); // reinicia la creacion de la nueva ficha y posicion de inicio
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) { //permite que el usuario desplace la ficha sin salirse de la arena
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset; // el movimiento solo es en el eje X es decir horizontal
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]); // se crea random para poner aleatoria la creacion de las fichas
    player.pos.y = 0; // ppone la ficha en el centro y arriba de la arena
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) { // si las fichas llenan el espacio vertical hasta llegar al limite superior, se reiniciara, poniendo todo en ceros
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) { // si la ficgha al rotar se encuentra con el limite de la arena no se puede salir, debe generar colision...

        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1)); //si gira cerca de los limites lo hara rebotar al lado contrario
        if (offset > player.matrix[0].length) { // si hay una colicion, se iniciara la posicion de donde empieza a bajar la ficha
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0; //dibuja contador de tiempo, como gotas cayendo----draw count
let dropInterval = 1000; // pone intervalo de 1000(milisegundos) para cada vez que cae un agota---interval 1 second

let lastTime = 0; // se crea variable para que se guarde el tiempo, con esto se puede ir aumentando la velocidad del juego
function update(time = 0) { // se inicia el tiempo en ceros
    const deltaTime = time - lastTime;//se hace una constante del tiempo que se va a aumentar en el contador

    dropCounter += deltaTime; //dorp counter es como el goteo de las piezas, con que velocidad va a caer, la relacion con el tiempo es para que se vaya aumentando la velocidad a medida que el usuario avanza en el juego
    if (dropCounter > dropInterval) { //cuando deje de caer la ficha, se iniciara nuevamente la ciada de otra
        playerDrop(); // restablece flujo normal de la ficha
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score; //genera el conteo del jugador
}

document.addEventListener('keydown', event => { //guarda un evento click de teclado
    if (event.keyCode === 37) { // es el codigo de la tecla izquierda
        playerMove(-1);
    } else if (event.keyCode === 39) { // es el codigo de la tecla de flecha derecha
        playerMove(1);
    } else if (event.keyCode === 40) {// es el codigo de la tecla de flecha abajo
        playerDrop(); //-------------------restablece el flujo y velocidad normal de la ficha
    } else if (event.keyCode === 81) { // es el codigo de la tecla de flecha abajo Q  contrario a las manecillas del reloj
        playerRotate(-1); //gira en contra de las manecillas del reloj
    } else if (event.keyCode === 87) {// es el codigo de la tecla de flecha abajo W gira en el sentido de las manecillas del reloj
        playerRotate(1); // gira con las manecillas del reloj 
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

const arena = createMatrix(12, 20);  // es por donde se desplazan las fihas, y quedan atascadas, cuando no llenan una fila

const player = { 
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0, //puntuacion de jugador inicia en cero
};

playerReset();
updateScore();
update();
