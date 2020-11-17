import React from "react";
import ReactDOM from "react-dom";
import ReactDataGrid from "react-data-grid";
import "react-data-grid/dist/react-data-grid.css";
/* 
Comment above ReactDataGrid import and uncomment below import to see that the issue is fixed
*/
// import ReactDataGrid from "fixed-react-data-grid";
// import ReactDataGrid from "fixed-react-data-grid";
import { range } from "lodash";
import "./styles.css";

const columns = [
  { key: "id", name: "ID", editable: true },
  { key: "title", name: "Title", editable: true },
  { key: "complete", name: "Complete", editable: true }
];

const rows = [
  { id: 0, title: "Task 1", complete: 20 },
  { id: 1, title: "Task 2", complete: 40 },
  { id: 2, title: "Task 3", complete: 60 }
];
const defaultParsePaste = str => {
  console.log(str);
  return str.split(/\r\n|\n|\r/).map(row => row.split("\t"));
};

const changedValues = {};
class Example extends React.Component {
  constructor(props) {
    super(props);
    const defaultColumnProperties = {
      resizable: true,
      // filterable: true,
      // filterRenderer: AutoCompleteFilter,
      editable: true
      // sortable: true
    };
    this.state = {
      rows,
      topLeft: {},
      botmRight: {},
      filters: ""
    };

    // Copy paste event handler
    document.addEventListener("copy", this.handleCopy);
    document.addEventListener("paste", this.handlePaste);
    // document.addEventListener('keydown', this.handleEnter);
  }

  componentWillUnmount() {
    this.removeAllListeners();
  }

  removeAllListeners = () => {
    document.removeEventListener("copy", this.handleCopy);
    document.removeEventListener("paste", this.handlePaste);
    // document.removeEventListener('keydown', this.handleEnter);
  };

  rowGetter = i => {
    const { rows } = this.state;
    return rows[i];
  };

  updateRows = (startIdx, newRows) => {
    this.setState(state => {
      const rows = state.rows.slice();
      for (let i = 0; i < newRows.length; i++) {
        if (startIdx + i < rows.length) {
          changedValues[startIdx + i] = {
            ...changedValues[startIdx + i],
            ...newRows[i]
          };
          rows[startIdx + i] = { ...rows[startIdx + i], ...newRows[i] };
        }
      }
      return { rows };
    });
  };

  handleCopy = e => {
    console.log(e);
    e.preventDefault();
    const { topLeft, botmRight } = this.state;
    // Loop through each row
    const text = range(topLeft.rowIdx, botmRight.rowIdx + 1)
      .map(
        // Loop through each column
        rowIdx =>
          columns
            .slice(topLeft.colIdx, botmRight.colIdx + 1)
            .map(
              // Grab the row values and make a text string
              col => this.rowGetter(rowIdx)[col.key]
            )
            .join("\t")
      )
      .join("\n");
    // console.log(text)
    e.clipboardData.setData("text/plain", text);
  };

  handlePaste = e => {
    e.preventDefault();
    const { topLeft } = this.state;

    const newRows = [];
    const pasteData = defaultParsePaste(e.clipboardData.getData("text/plain"));

    pasteData.forEach(row => {
      const rowData = {};
      // Merge the values from pasting and the keys from the columns
      columns
        .slice(topLeft.colIdx, topLeft.colIdx + row.length)
        .forEach((col, j) => {
          // Create the key-value pair for the row
          rowData[col.key] = row[j];
        });
      // Push the new row to the changes
      newRows.push(rowData);
    });

    this.updateRows(topLeft.rowIdx, newRows);
  };
  setSelection = args => {
    // console.log(args)
    this.setState({
      topLeft: {
        rowIdx: args.topLeft.rowIdx,
        colIdx: args.topLeft.idx
      },
      botmRight: {
        rowIdx: args.bottomRight.rowIdx,
        colIdx: args.bottomRight.idx
      }
    });
  };
  onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    this.setState(state => {
      const rows = state.rows.slice();
      for (let i = fromRow; i <= toRow; i++) {
        rows[i] = { ...rows[i], ...updated };
      }
      return { rows };
    });
  };
  render() {
    return (
      <ReactDataGrid
        columns={columns}
        rowGetter={i => this.state.rows[i]}
        rowsCount={3}
        onGridRowsUpdated={this.onGridRowsUpdated}
        enableCellSelect={true}
        cellRangeSelection={{
          onComplete: this.setSelection
        }}
      />
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Example />, rootElement);
