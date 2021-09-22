const GAME_STATUS = { WIN: 3, DRAW: 1, LOSE: 0 };
const { updateRecords } = require("../users");
const { saveGame } = require("../games");

const initiate = (gameType) => {
    const dimension = gameType; //temp
    // create an empy dimen*dimen*dimen table
    //algorythm: ex for dimension = 4:
    //table = [ [null*4]*4 ] * 4
    let indexes = [];
    for (let i = 0; i < dimension; i++) indexes.push(i);
    const table = indexes.map(() => indexes.map(() => indexes.map(() => null)));

    //return game data
    return {
        dimension,
        playerX: { id: null, socket: null, score: 0 },
        playerO: { id: null, socket: null, score: 0 },
        lastMove: null,
        emptyCells: dimension * dimension * dimension,
        table,
        turn: 0,
        gameID: null,
    };
};

const collectScores = (counts, dimension) => {
    let totalScore = 0;
    counts.forEach((count) => {
        if (count === dimension) totalScore++;
    });
    return totalScore;
};

const getCellCoordinates = (cellID, dimen) => {
    const cellFloor = Math.floor(cellID / (dimen * dimen));
    const onFloorId = cellID % (dimen * dimen);
    const cellRow = Math.floor(onFloorId / dimen);
    const cellColumn = onFloorId % dimen;
    // just test a random id to see how above formula works!
    return { floor: cellFloor, row: cellRow, column: cellColumn };
};

const inspectAreaAroundTheCell = async (game, cell) => {
    const { floor, row, column } = cell;
    const { playerX, playerO, dimension, table } = game;

    const playerInTheCell = table[floor][row][column];
    let rowCount = 0,
        columnCount = 0,
        floorMainDiagCount = 0,
        floorSideDiagCount = 0;
    let tableMainDiagCount = 0,
        tableSideDiagCount = 0,
        tableAltitudeCount = 0;
    for (let i = 0; i < dimension; i++) {
        if (table[floor][row][i] === playerInTheCell) rowCount++; // inspect in a row
        if (table[floor][i][column] === playerInTheCell) columnCount++; // inspect in a column
        if (table[i][row][column] === playerInTheCell) tableAltitudeCount++; // inspect in a altitude line
        if (row === column) {
            if (table[floor][i][i] === playerInTheCell) floorMainDiagCount++; // inspect in a 2D main diagonal line through the cell's floor
            if (row === floor && table[i][i][i] === playerInTheCell)
                tableMainDiagCount++; // inspect in a 3D main diagonal line through the whole table
        }
        if (row + column + 1 === dimension) {
            if (table[floor][i][dimension - i - 1] === playerInTheCell)
                floorSideDiagCount++; // inpect in a 2D side Diagonal line through the cell's floor
            if (
                row === floor &&
                table[i][i][dimension - i - 1] === playerInTheCell
            )
                tableSideDiagCount++; // inspect in a 3D side diagonal line through the whole table
        }
    }

    const totalScores = collectScores(
        [
            rowCount,
            columnCount,
            floorMainDiagCount,
            floorSideDiagCount,
            tableMainDiagCount,
            tableSideDiagCount,
            tableAltitudeCount,
        ],
        dimension
    );

    if (playerInTheCell === 0) playerX.score += totalScores;
    else playerO.score += totalScores;

    try {
        if (totalScores > 0)
            await saveGame(
                game.gameID,
                game.playerX.id,
                game.playerO.id,
                game.playerX.score,
                game.playerO.score,
                true
            );
    } catch (err) {
        console.log(err);
    }
};

const evaluateAndEndGame = async (game) => {
    try {
        const { playerX, playerO } = game;
        // first update each player's records
        let xAchievement = undefined,
            oAchievement = undefined;
        if (playerX.score > playerO.score) {
            xAchievement = GAME_STATUS.WIN;
            oAchievement = GAME_STATUS.LOSE;
        } else if (playerX.score < playerO.score) {
            xAchievement = GAME_STATUS.LOSE;
            oAchievement = GAME_STATUS.WIN;
        } else xAchievement = oAchievement = GAME_STATUS.DRAW;

        updateRecords(playerX.id, xAchievement);
        updateRecords(playerO.id, oAchievement);

        // now save game result in games collection:

        await saveGame(
            game.gameID,
            game.playerX.id,
            game.playerO.id,
            game.playerX.score,
            game.playerO.score,
            false
        );
    } catch (err) {
        console.log(err);
        //check ...
    }
};

module.exports = {
    initiate,
    getCellCoordinates,
    inspectAreaAroundTheCell,
    evaluateAndEndGame,
};
