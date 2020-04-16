
const stateUpdate = square => {
  let states = "grid-square ";
  if (square.status === "occupied" && square.hover) {
    states += "active-occupied";
  } else if (square.hover) {
    states += "active";
  } else if (square.status === "occupied") {
    states += "occupied";
  } else if (square.status === "hit") {
    states += "hit";
  } else if (square.status === "sunk") {
    states += "sunk";
  }
  return states;
};
let SIZE = 11;

const placeShip = ({ grid, row, col, rotated, ships, currentShip }) => {
  if (isOccupied(grid, row, col, rotated, ships, currentShip)) {
    return null;
  } else {
    if(ships[currentShip].type !== "T-Carrier" && ships[currentShip].type !== "L-Submarine")
    {
      if (rotated === 0) {
        if (row <= SIZE - ships[currentShip].size) {
          for (let i = 0; i < ships[currentShip].size; i++) {
            grid[row + i][col].status = "occupied";
            grid[row + i][col].type = ships[currentShip].type;
            grid[row + i][col].hover = false;
            ships[currentShip].positions.push({ row: row + i, col});
          }
          return {
            grid,
            ships
          };
        }
      } 
      else if (rotated === 1) {
        if (col <= SIZE - ships[currentShip].size) {
          for (let i = 0; i < ships[currentShip].size; i++) {
            grid[row][col + i].status = "occupied";
            grid[row][col + i].type = ships[currentShip].type;
            grid[row][col + i].hover = false;
            ships[currentShip].positions.push({ row, col: col + i});
          }
          return {
            grid,
            ships
          };
        }
      }
      else if (rotated === 2) {
        if (row >= ships[currentShip].size) {
          for (let i = 0; i < ships[currentShip].size; i++) {
            grid[row - i][col].status = "occupied";
            grid[row - i][col].type = ships[currentShip].type;
            grid[row - i][col].hover = false;
            ships[currentShip].positions.push({ row: row - i, col});
          }
          return {
            grid,
            ships
          };
        }
      }
      else if(rotated === 3) {
        if (col >= ships[currentShip].size) {
          for (let i = 0; i < ships[currentShip].size; i++) {
            grid[row][col - i].status = "occupied";
            grid[row][col - i].type = ships[currentShip].type;
            grid[row][col - i].hover = false;
            ships[currentShip].positions.push({ row, col: col - i});
          }
          return {
            grid,
            ships
          };
        }
      }
    }
    else
    {
      if(ships[currentShip].type === "T-Carrier")
      {
        if(rotated === 0)
        {
          if(row <= SIZE - 4 && col <= SIZE - 2 && col > 1) {
            var i=0;
            for (; i < 4; i++) {
              grid[row + i][col].status = "occupied";
              grid[row + i][col].type = ships[currentShip].type;
              grid[row + i][col].hover = false;
              ships[currentShip].positions.push({ row: row + i, col});
            }
            i--;
            grid[row + i][col + 1].status = "occupied";
            grid[row + i][col + 1].type = ships[currentShip].type;
            grid[row + i][col + 1].hover = false;
            ships[currentShip].positions.push({ row: row + i, col: col + 1});
            grid[row + i][col - 1].status = "occupied";
            grid[row + i][col - 1].type = ships[currentShip].type;
            grid[row + i][col - 1].hover = false;
            ships[currentShip].positions.push({ row: row + i, col: col - 1});
            return {
              grid,
              ships
            };
          }
        }
        else if(rotated === 1)
        {
          if(col <= SIZE - 4 && row <= SIZE - 2 && row > 1) {
            i=0;
            for (; i < 4; i++) {
              grid[row][col + i].status = "occupied";
              grid[row][col + i].type = ships[currentShip].type;
              grid[row][col + i].hover = false;
              ships[currentShip].positions.push({ row, col: col + i});
            }
            i--;
            grid[row + 1][col + i].status = "occupied";
            grid[row + 1][col + i].type = ships[currentShip].type;
            grid[row + 1][col + i].hover = false;
            ships[currentShip].positions.push({ row: row + 1, col: col + i});
            grid[row - 1][col + i].status = "occupied";
            grid[row - 1][col + i].type = ships[currentShip].type;
            grid[row - 1][col + i].hover = false;
            ships[currentShip].positions.push({ row: row - 1, col: col + i});
            return {
              grid,
              ships
            };
          }
        }
        else if(rotated === 2)
        {
          if(row >= 4 && col <= SIZE - 2 && col > 1) {
            i=0;
            for (; i < 4; i++) {
              grid[row - i][col].status = "occupied";
              grid[row - i][col].type = ships[currentShip].type;
              grid[row - i][col].hover = false;
              ships[currentShip].positions.push({ row: row - i, col});
            }
            i--;
            grid[row - i][col + 1].status = "occupied";
            grid[row - i][col + 1].type = ships[currentShip].type;
            grid[row - i][col + 1].hover = false;
            ships[currentShip].positions.push({ row: row - i, col: col + 1});
            grid[row - i][col - 1].status = "occupied";
            grid[row - i][col - 1].type = ships[currentShip].type;
            grid[row - i][col - 1].hover = false;
            ships[currentShip].positions.push({ row: row - i, col: col - 1});
            return {
              grid,
              ships
            };
          }
        }
        else
        {
          if(col >= 4 && row <= SIZE - 2 && row > 1) {
            i=0;
            for (; i < 4; i++) {
              grid[row][col - i].status = "occupied";
              grid[row][col - i].type = ships[currentShip].type;
              grid[row][col - i].hover = false;
              ships[currentShip].positions.push({ row, col: col - i});
            }
            i--;
            grid[row + 1][col - i].status = "occupied";
            grid[row + 1][col - i].type = ships[currentShip].type;
            grid[row + 1][col - i].hover = false;
            ships[currentShip].positions.push({ row: row + 1, col: col - i});
            grid[row - 1][col - i].status = "occupied";
            grid[row - 1][col - i].type = ships[currentShip].type;
            grid[row - 1][col - i].hover = false;
            ships[currentShip].positions.push({ row: row - 1, col: col - i});
            return {
              grid,
              ships
            };
          }
        }
      }
      else
      {
        // L-Submarine implementation 
        if(rotated === 0)
        {
          if(row <= SIZE - 4 && col <= SIZE - 3) {
            i=0;
            for (; i < 4; i++) {
              grid[row + i][col].status = "occupied";
              grid[row + i][col].type = ships[currentShip].type;
              grid[row + i][col].hover = false;
              ships[currentShip].positions.push({ row: row + i, col});
            }
            i--;
            grid[row + i][col + 1].status = "occupied";
            grid[row + i][col + 1].type = ships[currentShip].type;
            grid[row + i][col + 1].hover = false;
            ships[currentShip].positions.push({ row: row + i, col: col + 1});
            grid[row + i][col + 2].status = "occupied";
            grid[row + i][col + 2].type = ships[currentShip].type;
            grid[row + i][col + 2].hover = false;
            ships[currentShip].positions.push({ row: row + i, col: col + 2});
            return {
              grid,
              ships
            };
          }
        }
        else if(rotated === 1)
        {
          if(col <= SIZE - 4 && row >= 3) {
            i=0;
            for (; i < 4; i++) {
              grid[row][col + i].status = "occupied";
              grid[row][col + i].type = ships[currentShip].type;
              grid[row][col + i].hover = false;
              ships[currentShip].positions.push({ row, col: col + i});
            }
            i--;
            grid[row - 1][col + i].status = "occupied";
            grid[row - 1][col + i].type = ships[currentShip].type;
            grid[row - 1][col + i].hover = false;
            ships[currentShip].positions.push({ row: row - 1, col: col + i});
            grid[row - 2][col + i].status = "occupied";
            grid[row - 2][col + i].type = ships[currentShip].type;
            grid[row - 2][col + i].hover = false;
            ships[currentShip].positions.push({ row: row - 2, col: col + i});
            return {
              grid,
              ships
            };
          }
        }
        else if(rotated === 2)
        {
          if(row >= 4 && col >= 3) {
            i=0;
            for (; i < 4; i++) {
              grid[row - i][col].status = "occupied";
              grid[row - i][col].type = ships[currentShip].type;
              grid[row - i][col].hover = false;
              ships[currentShip].positions.push({ row: row - i, col});
            }
            i--;
            grid[row - i][col - 1].status = "occupied";
            grid[row - i][col - 1].type = ships[currentShip].type;
            grid[row - i][col - 1].hover = false;
            ships[currentShip].positions.push({ row: row - i, col: col - 1});
            grid[row - i][col - 2].status = "occupied";
            grid[row - i][col - 2].type = ships[currentShip].type;
            grid[row - i][col - 2].hover = false;
            ships[currentShip].positions.push({ row: row - i, col: col - 2});
            return {
              grid,
              ships
            };
          }
        }
        else
        {
          if(col >= 4 && row <= SIZE - 3) {
            i=0;
            for (; i < 4; i++) {
              grid[row][col - i].status = "occupied";
              grid[row][col - i].type = ships[currentShip].type;
              grid[row][col - i].hover = false;
              ships[currentShip].positions.push({ row, col: col - i});
            }
            i--;
            grid[row + 1][col - i].status = "occupied";
            grid[row + 1][col - i].type = ships[currentShip].type;
            grid[row + 1][col - i].hover = false;
            ships[currentShip].positions.push({ row: row + 1, col: col - i});
            grid[row + 2][col - i].status = "occupied";
            grid[row + 2][col - i].type = ships[currentShip].type;
            grid[row + 2][col - i].hover = false;
            ships[currentShip].positions.push({ row: row + 2, col: col - i});
            return {
              grid,
              ships
            };
          }
        }
      }
    } 
  }
  return null;
};


const isOccupied = (grid, row, col, rotated, ships, currentShip) => {
  let isTaken = false;
  if(ships[currentShip].type !== "T-Carrier" && ships[currentShip].type !== "L-Submarine")
  {
    if (rotated === 0) {
      if (row <= SIZE - ships[currentShip].size) {
        for (let i = 0; i < ships[currentShip].size; i++) {
          if (grid[row + i][col].status === "occupied") {
            isTaken = true;
          }
        }
      }
    } 
    else if(rotated === 1) {
      if (col <= SIZE - ships[currentShip].size) {
        for (let i = 0; i < ships[currentShip].size; i++) {
          if (grid[row][col + i].status === "occupied") {
            isTaken = true;
          }
        }
      }
    }
    else if(rotated === 2) {
      if (row >= ships[currentShip].size) {
        for (let i = 0; i < ships[currentShip].size; i++) {
          if (grid[row - i][col].status === "occupied") {
            isTaken = true;
          }
        }
      }
    }
    else {
      if (col >= ships[currentShip].size) {
        for (let i = 0; i < ships[currentShip].size; i++) {
          if (grid[row][col - i].status === "occupied") {
            isTaken = true;
          }
        }
      }
    }
  }
  else
  {
    if(ships[currentShip].type === "T-Carrier")
    {
      if(rotated === 0)
      {
        if(row <= SIZE - 4 && col <= SIZE - 2 && col > 1) {
            var i=0;
            for (; i < 4; i++) {
              if(grid[row + i][col].status === "occupied") isTaken = true;
            }
            i--;
            if(grid[row + i][col + 1].status === "occupied" || grid[row + i][col - 1].status === "occupied") isTaken = true;
          }
      }
      else if(rotated === 1)
      {
        if(col <= SIZE - 4 && row <= SIZE - 2 && row > 1) {
            i=0;
            for (; i < 4; i++) {
             if(grid[row][col + i].status === "occupied") isTaken = true;
            }
            i--;
            if(grid[row + 1][col + i].status === "occupied" || grid[row - 1][col + i].status === "occupied") isTaken = true;
          }

      }
      else if(rotated === 2)
      {
        if(row >= 4 && col <= SIZE - 2 && col > 1) {
            i=0;
            for (; i < 4; i++) {
              if(grid[row - i][col].status === "occupied") isTaken = true;
            }
            i--;
            if(grid[row - i][col + 1].status === "occupied" || grid[row - i][col - 1].status === "occupied") isTaken = true;
          }
      }
      else
      {
        if(col >= 4 && row <= SIZE - 2 && row > 1) {
            i=0;
            for (; i < 4; i++) {
              if(grid[row][col - i].status === "occupied") isTaken = true;
            }
            i--;
            if(grid[row + 1][col - i].status === "occupied" || grid[row - 1][col - i].status === "occupied") isTaken = true; 
          }
      }
    }
    else
    {
      // L-Submarine implementation
      if(rotated === 0)
      {
        if(row <= SIZE - 4 && col <= SIZE - 3) {
            i=0;
            for (; i < 4; i++) {
              if(grid[row + i][col].status === "occupied") isTaken = true;
            }
            i--;
            if(grid[row + i][col + 1].status === "occupied" || grid[row + i][col + 2].status === "occupied") isTaken = true;
          }
      }
      else if(rotated === 1)
      {
        if(col <= SIZE - 4 && row >= 3) {
            i=0;
            for (; i < 4; i++) {
             if(grid[row][col + i].status === "occupied") isTaken = true;
            }
            i--;
            if(grid[row - 1][col + i].status === "occupied" || grid[row - 2][col + i].status === "occupied") isTaken = true;
          }

      }
      else if(rotated === 2)
      {
        if(row >= 4 && col >= 3) {
            i=0;
            for (; i < 4; i++) {
              if(grid[row - i][col].status === "occupied") isTaken = true;
            }
            i--;
            if(grid[row - i][col - 1].status === "occupied" || grid[row - i][col - 2].status === "occupied") isTaken = true;
          }
      }
      else
      {
        if(col >= 4 && row <= SIZE - 3) {
            i=0;
            for (; i < 4; i++) {
              if(grid[row][col - i].status === "occupied") isTaken = true;
            }
            i--;
            if(grid[row + 1][col - i].status === "occupied" || grid[row + 2][col - i].status === "occupied") isTaken = true; 
          }
      }
    }
  }  
  return isTaken;
};



const hoverUpdate = ({ grid, row, col, rotated, type, ships, currentShip }) => {
  var bool = false;
  if(type === "enter")
  {
    bool = true;
  }
  if(ships[currentShip].type !== "T-Carrier" && ships[currentShip].type !== "L-Submarine")
  {
    if (rotated === 0) {
      if (row <= SIZE - ships[currentShip].size) {
        for (let i = 0; i < ships[currentShip].size; i++) {
          grid[row + i][col].hover = bool;
        }
      }
    } 
    else if(rotated === 1){
      if (col <= SIZE - ships[currentShip].size) {
        for (let i = 0; i < ships[currentShip].size; i++) {
          grid[row][col + i].hover = bool;
        }
      }
    }
    else if(rotated === 2){
      if (row >= ships[currentShip].size) {
        for (let i = 0; i < ships[currentShip].size; i++) {
          grid[row - i][col].hover = bool;
        }
      }
    }
    else if(rotated === 3){
      if (col >= ships[currentShip].size) {
        for (let i = 0; i < ships[currentShip].size; i++) {
          grid[row][col - i].hover = bool;
        }
      }
    }
  }
  else
  {
    if(ships[currentShip].type === "T-Carrier")
      {
        if(rotated === 0)
        {
          if(row <= SIZE - 4 && col <= SIZE - 2 && col > 1) {
            var i=0;
            for (; i < 4; i++) {
              grid[row + i][col].hover = bool;
            }
            i--;
            grid[row + i][col + 1].hover = bool;
            grid[row + i][col - 1].hover = bool;
          }
        }
        else if(rotated === 1)
        {
          if(col <= SIZE - 4 && row <= SIZE - 2 && row > 1) {
            i=0;
            for (; i < 4; i++) {
              grid[row][col + i].hover = bool;
            }
            i--;
            grid[row + 1][col + i].hover = bool;
            grid[row - 1][col + i].hover = bool;
          }

        }
        else if(rotated === 2)
        {
          if(row >= 4 && col <= SIZE - 2 && col > 1) {
            i=0;
            for (; i < 4; i++) {
              grid[row - i][col].hover = bool;
            }
            i--;
            grid[row - i][col + 1].hover = bool;
            grid[row - i][col - 1].hover = bool;
          }

        }
        else
        {
          if(col >= 4 && row <= SIZE - 2 && row > 1) {
            i=0;
            for (; i < 4; i++) {
              grid[row][col - i].hover = bool;
            }
            i--;
            grid[row + 1][col - i].hover = bool;
            grid[row - 1][col - i].hover = bool;
          }
        }
      }
      else
      {
        // L-Submarine implementation
        if(rotated === 0)
        {
          if(row <= SIZE - 4 && col <= SIZE - 3) {
            i=0;
            for (; i < 4; i++) {
              grid[row + i][col].hover = bool;
            }
            i--;
            grid[row + i][col + 1].hover = bool;
            grid[row + i][col + 2].hover = bool;
          }
        }
        else if(rotated === 1)
        {
          if(col <= SIZE - 4 && row >= 3) {
            i=0;
            for (; i < 4; i++) {
              grid[row][col + i].hover = bool;
            }
            i--;
            grid[row - 1][col + i].hover = bool;
            grid[row - 2][col + i].hover = bool;
          }

        }
        else if(rotated === 2)
        {
          if(row >= 4 && col >= 3) {
            i=0;
            for (; i < 4; i++) {
              grid[row - i][col].hover = bool;
            }
            i--;
            grid[row - i][col - 1].hover = bool;
            grid[row - i][col - 2].hover = bool;
          }

        }
        else
        {
          if(col >= 4 && row <= SIZE - 3) {
            i=0;
            for (; i < 4; i++) {
              grid[row][col - i].hover = bool;
            }
            i--;
            grid[row + 1][col - i].hover = bool;
            grid[row + 2][col - i].hover = bool;
          }
        }
      }

  }
  
  return grid;
};
module.exports = {
  placeShip,
  hoverUpdate,
  stateUpdate
};
