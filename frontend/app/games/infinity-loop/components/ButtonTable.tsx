// components/CenteredTable.tsx

import React, { useState} from "react";
import RotatingButton from "./RotatingButton";
import Win from "./Win";

interface ButtonTableProps {
  sound: boolean;
  arr: Array<Array<Array<number>>>;
  setArr: (arr: Array<Array<Array<number>>>)=>void
}

const ButtonTable: React.FC<ButtonTableProps> = ({ sound, arr, setArr }) => {
  const [won, setWon] = useState(false);

  const hasRight = (buttonType: number, rotateState: number) => {
    return (
      (buttonType == 0 && rotateState == 0) ||
      (buttonType == 1 && rotateState == 0) ||
      (buttonType == 2 && (rotateState == 0 || rotateState == 3)) ||
      (buttonType == 3 && rotateState != 2) ||
      buttonType == 4
    );
  };
  const hasLeft = (buttonType: number, rotateState: number) => {
    return (
      (buttonType == 0 && rotateState == 0) ||
      (buttonType == 1 && rotateState == 2) ||
      (buttonType == 2 && (rotateState == 1 || rotateState == 2)) ||
      (buttonType == 3 && rotateState != 0) ||
      buttonType == 4
    );
  };
  const hasUp = (buttonType: number, rotateState: number) => {
    return (
      (buttonType == 0 && rotateState == 1) ||
      (buttonType == 1 && rotateState == 3) ||
      (buttonType == 2 && (rotateState == 2 || rotateState == 3)) ||
      (buttonType == 3 && rotateState != 1) ||
      buttonType == 4
    );
  };
  const hasDown = (buttonType: number, rotateState: number) => {
    return (
      (buttonType == 0 && rotateState == 1) ||
      (buttonType == 1 && rotateState == 1) ||
      (buttonType == 2 && (rotateState == 0 || rotateState == 1)) ||
      (buttonType == 3 && rotateState != 3) ||
      buttonType == 4
    );
  };

  const newWinCount = (
    buttonType: number,
    rotateState: number,
    row: number,
    col: number
  ) => {
    let addval = 0;
    if (buttonType == 0 && rotateState == 0) {
      addval +=
        0 -
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) -
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0);
    } else if (buttonType == 0 && rotateState == 1) {
      addval +=
        0 -
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) -
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 0) {
      addval +=
        0 -
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 1) {
      addval +=
        0 -
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 2) {
      addval +=
        0 -
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 3) {
      addval +=
        0 -
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 0) {
      addval +=
        0 -
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) -
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 1) {
      addval +=
        0 -
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) -
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 2) {
      addval +=
        0 -
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) -
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 3) {
      addval +=
        0 -
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) -
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 0) {
      addval +=
        0 -
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) -
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) -
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 1) {
      addval +=
        0 -
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) -
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) -
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 2) {
      addval +=
        0 -
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) -
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) -
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 3) {
      addval +=
        0 -
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) -
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) -
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 4) {
      addval +=
        winCount -
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) -
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) -
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) -
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    }

    rotateState = (rotateState + 1) % (buttonType == 0 ? 2 : 4);

    if (buttonType == 0 && rotateState == 0) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0);
    } else if (buttonType == 0 && rotateState == 1) {
      addval +=
        0 +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 0) {
      addval +=
        0 +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 1) {
      addval +=
        0 +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 2) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 3) {
      addval +=
        0 +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 0) {
      addval +=
        0 +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 1) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 2) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 3) {
      addval +=
        0 +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 0) {
      addval +=
        0 +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 1) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 2) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 3) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 4) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    }
    return 2 * addval;
  };
  const initWinCount = (
    buttonType: number,
    rotateState: number,
    row: number,
    col: number
  ) => {
    let addval = 0;

    if (buttonType == 0 && rotateState == 0) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0);
    } else if (buttonType == 0 && rotateState == 1) {
      addval +=
        0 +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 0) {
      addval +=
        0 +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 1) {
      addval +=
        0 +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 2) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0);
    } else if (buttonType == 1 && rotateState == 3) {
      addval +=
        0 +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 0) {
      addval +=
        0 +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 1) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 2) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 2 && rotateState == 3) {
      addval +=
        0 +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 0) {
      addval +=
        0 +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 1) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 2) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 3 && rotateState == 3) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0);
    } else if (buttonType == 4) {
      addval +=
        0 +
        (col != 0 && hasRight(arr[row][col - 1][0], arr[row][col - 1][1])
          ? 1
          : 0) +
        (col != arr[0].length - 1 &&
        hasLeft(arr[row][col + 1][0], arr[row][col + 1][1])
          ? 1
          : 0) +
        (row != 0 && hasDown(arr[row - 1][col][0], arr[row - 1][col][1])
          ? 1
          : 0) +
        (row != arr.length - 1 &&
        hasUp(arr[row + 1][col][0], arr[row + 1][col][1])
          ? 1
          : 0);
    }
    return addval;
  };

  let temp1 = 0;
  let temp2 = 0;

  const checkValidFig = (x: number) => {
    return x == 0 || x == 1 || x == 2 || x == 3 || x == 4;
  };

  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr[i].length; j++) {
      if (checkValidFig(arr[i][j][0]))
        temp2 += arr[i][j][0] == 0 ? 2 : arr[i][j][0];
      temp1 += initWinCount(arr[i][j][0], arr[i][j][1], i, j);
    }
  const [winCount, setWinCount] = useState(temp1);
  const [winLim] = useState(temp2);

  const checkWin = () => {
    const audio = new Audio("/goodresult-82807.mp3");
    if (sound) audio.play();
    setWon(true);
  };
  const setArrVal = (row: number, col: number, value: number) => {
    let temp = [...arr];
    temp[row][col][1] = value;
    setArr(temp);
  };

  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds delay

    // Cleanup the timer if the component is unmounted
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div> {/* Customize your loader here */}
      </div>
    );
  }

  return (
    <>
      {won && <Win />}
      {!won && (
        <div className="flex justify-center items-center h-screen">
          <table className="table-auto border-collapse">
            <tbody>
              {arr.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((val, colIndex) => (
                    <td key={colIndex} className="p-0 aspect-square">
                      <RotatingButton
                        buttonType={val[0]}
                        state={val[1]}
                        winCount={winCount}
                        row={rowIndex}
                        col={colIndex}
                        setWinCount={setWinCount}
                        checkWin={checkWin}
                        winLim={winLim}
                        newWinCount={newWinCount}
                        setArrVal={setArrVal}
                        sound={sound}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default ButtonTable;
