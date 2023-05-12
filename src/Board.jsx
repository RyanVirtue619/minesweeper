import React, { useEffect, useRef, useState } from "react";
import * as c from "./Constants";
import Square from "./Square";
import "./Board.css";
import { uuidv4 } from "@firebase/util";

export default function Board(props) {
  //Holds board data
  const [board, setBoard] = useState([]);
  //Records whether the first mine is clicked
  const [firstClick, setFirstClick] = useState(true);
  const [ids, setIds] = useState([]);
  const ref = useRef({});
  //Inits empty board
  useEffect(() => {
    setFirstClick(true);
    let ar = [];
    for (var i = 0; i < props.rows; i++) {
      let row = [];
      ar.push(row);
    }
    for (i = 0; i < props.rows; i++) {
      for (var j = 0; j < props.cols; j++) {
        ar[i].push(c.CONSTANTS.Empty);
      }
    }
    setBoard(ar);
    let bar = [];
    for (i = 0; i < props.rows; i++) {
      let row = [];
      bar.push(row);
    }
    for (i = 0; i < props.rows; i++) {
      for (j = 0; j < props.cols; j++) {
        bar[i].push(uuidv4());
      }
    }
    setIds(bar);
  }, [props.cols, props.rows, props.mines]);

  //Returns col number of 1frs
  function getCols() {
    return "1fr ".repeat(props.cols);
  }
  //Returns row number of 1frs
  function getRows() {
    return "1fr ".repeat(props.rows);
  }

  function getRef(row, col) {
    return ref.current[(row) + " " + (col)]
  }

  function updateSquares() {
    for (let i = 0; i < props.rows; i++) {
      for (let j = 0; j < props.cols; j++) {
        ref.current[i + " " + j].updateValue(board[i][j]);
      }
    }
  }

  function generateMines(row, col) {
    let tempBoard = board;
    let i = 0;
    while (i < props.mines) {
      let newRow = getRandomInt(props.rows);
      let newCol = getRandomInt(props.cols);
      if (
        tempBoard[newRow][newCol] !== -1 &&
        (newRow !== row || newCol !== col) &&
        Math.abs(newRow - row) + Math.abs(newCol - col) > 3
      ) {
        for (var j = -1; j < 2; j++) {
          for (var k = -1; k < 2; k++) {
            tempBoard[newRow][newCol] = c.CONSTANTS.Mine;
            if (
              newRow + j < props.rows &&
              newRow + j >= 0 &&
              newCol + k < props.cols &&
              newCol + k >= 0 &&
              tempBoard[newRow + j][newCol + k] !== -1
            ) {
              
              tempBoard[newRow + j][newCol + k]++;
            }
          }
        }
        i++;
      }
    }
    setBoard(tempBoard);
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function clickSquare(pos) {
    let row = pos.split(" ")[0];
    let col = pos.split(" ")[1];
    if (firstClick) {
      generateMines(row, col);
    }
    setFirstClick(false);
    if(board[row][col] === 0) {
      clearAdjacent(parseInt(row), parseInt(col))
    }
    updateSquares();
  }

  async function clearAdjacent(row, col) {

    for(let i = -1; i < 2; i += 2) {      
      if(col+i >= 0 && col+i < props.cols) {
        if(board[(row)][(col+i)] === 0 && !getRef(row, col+i).getStatus()) {
          await getRef(row, col+i).reveal();
          clearAdjacent(row,col+i)
        } 
      }
    
      if(row+i >= 0 && row + i < props.rows) {
        if(board[(row+i)][(col)] === 0 && !getRef(row + i, col).getStatus()) {
          await getRef(row+i, col).reveal();
          clearAdjacent(row+i,col)
        } 
      }
    }

    for(let j = -1; j < 2; j++) {
      for(let k = -1; k < 2; k++) {
        if(inBounds(row + j, col +k)) {
          await getRef(row + j, col + k).reveal();
        }
      }
    }
  }

  function inBounds(row ,col) {
    return row >= 0 && col >= 0 && col < props.cols && row < props.rows;
  }

  return (
    <div className="board">updateValue(
      I am board with {props.cols} columns and {props.rows} rows with{" "}
      {props.mines} mines resulting in a mine percent of{" "}
      {Math.round((props.mines / (props.rows * props.cols)) * 1000) / 10 + "%"}
      <div
        className="main-board"
        style={{ display: "grid", gridTemplateRows: getRows() }}
      >
        {board.map((row, rowInd) => {
          return (
            <div style={{ display: "grid", gridTemplateColumns: getCols() }}>
              {row.map((item, colInd) => {
                return (
                  <Square
                    key={ids[rowInd][colInd]}
                    revealed={false}
                    value={board[rowInd][colInd]}
                    row={rowInd}
                    col={colInd}
                    ref={(element) => {
                      if (element) {
                        ref.current[rowInd + " " + colInd] = element;
                      } else {
                        delete ref.current[rowInd + " " + colInd];
                      }
                    }}
                    onClick={(pos) => clickSquare(pos)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}